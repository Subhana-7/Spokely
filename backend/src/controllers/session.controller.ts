import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ISessionController } from "./interfaces/ISessionController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionService } from "../services/interfaces/ISessionService";

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
      const newSession = await this.sessionService.createSession(
        req.body,
        req.id
      );
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
      const sessions = await this.sessionService.getSessions(req.id);
      if (!sessions || sessions.length === 0) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }
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
      const updated = await this.sessionService.updateSession(
        req.params.id,
        req.body
      );
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
      const updated = await this.sessionService.respondToInvite(
        req.params.id,
        req.id!,
        req.body.status
      );
      res.json({ message: `Session ${req.body.status}`, session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  cancelParticipation = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const updated = await this.sessionService.cancelParticipation(
        req.params.id,
        req.id!,
        req.body.reason
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
      const updated = await this.sessionService.cancelSession(
        req.params.id,
        req.body.userId,
        req.body.reason
      );
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
      const updated = await this.sessionService.flagSession(
        req.params.id,
        req.id!,
        req.body.reason,
        req.body.againstUser
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
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const tokenData = await this.sessionService.getAgoraToken(
        req.params.id,
        req.id
      );
      if (!tokenData) {
        res.status(403).json({ message: "Not within session timeframe" });
        return;
      }
      res.json(tokenData);
    } catch {
      res.status(500).json({ message: "Failed to generate token" });
    }
  };

  getPublicSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const publicSessions = await this.sessionService.publicSessions();
      if (!publicSessions || publicSessions.length === 0) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }
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
      const updated = await this.sessionService.addFeedback(
        req.params.id,
        req.id!,
        req.body.to,
        req.body.comment,
        req.body.rating
      );
      res.json({ message: "Feedback added", session: updated });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  getAllSessionsAdmin = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const sessions = await this.sessionService.getAllSessionsAdmin(req.query);
      if (!sessions || sessions.length === 0) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }
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
      res.status(200).json({ session });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  };
}
