import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { generateAgoraToken } from "../config/agora";
import { ISessionController } from "./interfaces/ISessionController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionService } from "../services/interfaces/ISessionService";
import {
  mapToCreateSessionDTO,
  mapToUpdateSessionDTO,
} from "../mappers/session.mappers";

@injectable()
export class SessionController implements ISessionController {
  constructor(
    @inject(TYPES.ISessionService)
    private readonly sessionService: ISessionService
  ) {}

  createSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const dto = mapToCreateSessionDTO(req.body, req.id);
      if (dto.type === "private" || dto.mentorId) dto.status = "pending";
      else dto.status = "upcoming";

      const newSession = await this.sessionService.createSession(dto);
      res.status(201).json({ message: "Session created", session: newSession });
    } catch (error) {
      res.status(500).json({ message: "Failed to create session" });
    }
  };

  getAllSessions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) throw new Error("User not authenticated");

      const userId = req.id;
      let sessions = await this.sessionService.getSessions(userId);
      if (!sessions) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }

      const now = new Date();
      sessions = await Promise.all(
        sessions.map(async (session: any) => {
          const start = new Date(session.startTime);
          const end = new Date(
            session.endTime ||
              start.getTime() + (session.durationMinutes || 60) * 60000
          );

          if (session.status === "pending" && now >= start) {
            session.status = "cancelled";
            await this.sessionService.updateSession(session._id, {
              status: "cancelled",
            });
          } else if (
            (session.status === "upcoming" || session.status === "accepted") &&
            now > end
          ) {
            session.status = "completed";
            await this.sessionService.updateSession(session._id, {
              status: "completed",
            });
          }
          return session;
        })
      );

      res.status(200).json({ sessions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  };

  getSessionById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const session = await this.sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      res.status(200).json(session);
    } catch {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  };

  updateSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const sessionId = req.params.id;
      const dto = mapToUpdateSessionDTO(req.body);
      const updated = await this.sessionService.updateSession(sessionId, dto);

      res.status(200).json({ message: "Session updated", session: updated });
    } catch {
      res.status(500).json({ message: "Failed to update session" });
    }
  };

  respondToInvite = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { status } = req.body;
      const sessionId = req.params.id;
      const userId = req.id!;
      const updated = await this.sessionService.respondToInvite(
        sessionId,
        userId,
        status
      );
      res.json({ message: `Session ${status}`, session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  cancelParticipation = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { reason } = req.body;
      const updated = await this.sessionService.cancelParticipation(
        req.params.id,
        req.id!,
        reason
      );
      res.json({ message: "Participation cancelled", session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  cancelSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { reason } = req.body;
      const sessionId = req.params.id;
      const userId = req.body.userId;
      console.log(sessionId,userId,reason)
      const updated = await this.sessionService.cancelSession(
        sessionId,
        userId,
        reason
      );
      console.log('controller',updated)
      res.json({ message: "Session cancelled", session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  flagSession = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { reason, againstUser } = req.body;
      const updated = await this.sessionService.flagSession(
        req.params.id,
        req.id!,
        reason,
        againstUser
      );
      res.json({ message: "Session flagged", session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAgoraToken = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.id) res.status(401).json({ message: "Unauthorized" });

      const sessionId = req.params.id;
      const userId = req.id;
      const session = await this.sessionService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      const now = new Date();
      const start = new Date(session.startTime);
      const end = new Date(
        session.endTime ||
          new Date(start.getTime() + (session.durationMinutes || 60) * 60000)
      );

      if (!(now >= start && now <= end)) {
        res.status(403).json({ message: "Not within session timeframe" });
      }

      const channelName = `session_${sessionId}`;
      const token = generateAgoraToken(channelName, userId!.toString());
      res.json({
        token,
        channelName,
        appId: process.env.AGORA_APP_ID,
        uid: userId,
      });
    } catch {
      res.status(500).json({ message: "Failed to generate token" });
    }
  };

  getPublicSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      let publicSessions = await this.sessionService.publicSessions();
      if (!publicSessions)
        res.status(404).json({ message: "No sessions found" });
      res.status(200).json({ publicSessions });
    } catch {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  };

  addFeedback = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { to, comment, rating } = req.body;
      const sessionId = req.params.id;
      const from = req.id!;

      const updated = await this.sessionService.addFeedback(
        sessionId,
        from,
        to,
        comment,
        rating
      );
      if (!updated) {
        res.status(404).json({ message: "Session not found or not completed" });
        return;
      }

      res.json({ message: "Feedback added", session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAllSessionsAdmin = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    console.log("hitting--")
    try {
      const { status, type, mentorId } = req.query as {
        status?: string;
        type?: string;
        mentorId?: string;
      };

      const filters = { status, type, mentorId };

      let sessions = await this.sessionService.getAllSessionsAdmin(filters);

      if (!sessions || sessions.length === 0) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }

      console.log('d')

      res.status(200).json({ sessions });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };

  getSessionDetailsAdmin = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const session = await this.sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      console.log(session)

      res.status(200).json({ session });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
