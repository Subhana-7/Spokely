import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ISessionController } from "./interfaces/ISessionController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionService } from "../services/interfaces/ISessionService";
import { StatusCode } from "../utilis/status.code";

@injectable()
export class SessionController implements ISessionController {
  constructor(
    @inject(TYPES.ISessionService)
    private readonly sessionService: ISessionService
  ) {}

  createSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }
      const newSession = await this.sessionService.createSession(req.body, req.id);
      res.status(StatusCode.CREATED).json({ message: "Session created", session: newSession });
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to create session" });
    }
  };

  getAllSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) throw new Error("User not authenticated");
      const sessions = await this.sessionService.getSessions(req.id);
      if (!sessions || sessions.length === 0) {
        res.status(StatusCode.NOT_FOUND).json({ message: "No sessions found" });
        return;
      }
      res.status(StatusCode.OK).json({ sessions });
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions" });
    }
  };

  getSessionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await this.sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Session not found" });
        return;
      }
      res.status(StatusCode.OK).json(session);
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch session" });
    }
  };

  updateSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }
      const updated = await this.sessionService.updateSession(req.params.id, req.body);
      res.status(StatusCode.OK).json({ message: "Session updated", session: updated });
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to update session" });
    }
  };

  respondToInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this.sessionService.respondToInvite(req.params.id, req.id!, req.body.status);
      res.status(StatusCode.OK).json({ message: `Session ${req.body.status}`, session: updated });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  cancelParticipation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this.sessionService.cancelParticipation(req.params.id, req.id!, req.body.reason);
      res.status(StatusCode.OK).json({ message: "Participation cancelled", session: updated });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  cancelSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this.sessionService.cancelSession(req.params.id, req.body.userId, req.body.reason);
      res.status(StatusCode.OK).json({ message: "Session cancelled", session: updated });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  flagSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this.sessionService.flagSession(req.params.id, req.id!, req.body.reason, req.body.againstUser);
      res.status(StatusCode.OK).json({ message: "Session flagged", session: updated });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAgoraToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }
      const tokenData = await this.sessionService.getAgoraToken(req.params.id, req.id);
      if (!tokenData) {
        res.status(StatusCode.FORBIDDEN).json({ message: "Not within session timeframe" });
        return;
      }
      res.status(StatusCode.OK).json(tokenData);
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to generate token" });
    }
  };

  getPublicSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const publicSessions = await this.sessionService.publicSessions();
      if (!publicSessions || publicSessions.length === 0) {
        res.status(StatusCode.NOT_FOUND).json({ message: "No sessions found" });
        return;
      }
      res.status(StatusCode.OK).json({ publicSessions });
    } catch {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch sessions" });
    }
  };

  addFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this.sessionService.addFeedback(req.params.id, req.id!, req.body.to, req.body.comment, req.body.rating);
      res.status(StatusCode.OK).json({ message: "Feedback added", session: updated });
    } catch (err: any) {
      res.status(StatusCode.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAllSessionsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessions = await this.sessionService.getAllSessionsAdmin(req.query);
      if (!sessions || sessions.length === 0) {
        res.status(StatusCode.NOT_FOUND).json({ message: "No sessions found" });
        return;
      }
      res.status(StatusCode.OK).json({ sessions });
    } catch (err: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };

  getSessionDetailsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await this.sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(StatusCode.NOT_FOUND).json({ message: "Session not found" });
        return;
      }
      res.status(StatusCode.OK).json({ session });
    } catch (err: any) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };
}
