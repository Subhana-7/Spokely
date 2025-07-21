import { Request, Response } from "express";
import { SessionService } from "../services/session.service";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import mongoose from "mongoose";
import { generateAgoraToken } from "../config/agora";

const sessionService = new SessionService();

export class SessionController {
  constructor() {
    this.createSession = this.createSession.bind(this);
    this.getAllSessions = this.getAllSessions.bind(this);
    this.getSessionById = this.getSessionById.bind(this);
    this.updateSession = this.updateSession.bind(this);
    this.getAgoraToken = this.getAgoraToken.bind(this);
  }

  async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        type,
        topic,
        description,
        mentorId,
        startTime,
        endTime,
        participants,
        sessionFee,
      } = req.body;

      const newSession = await sessionService.createSession({
        type,
        topic,
        description,
        mentorId: mentorId ? new mongoose.Types.ObjectId(mentorId) : undefined,
        startTime,
        endTime,
        createdBy: new mongoose.Types.ObjectId(req.id),
        participants: participants?.map(
          (p: string) => new mongoose.Types.ObjectId(p)
        ),
        sessionFee,
      });

      res.status(201).json({ message: "Session created", session: newSession });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create session" });
    }
  }

  async getAllSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const sessions = await sessionService.getSessions();
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  }

  async getSessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const session = await sessionService.getSessionById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  }

  async updateSession(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await sessionService.updateSession(
        req.params.id,
        req.body
      );
      res.status(200).json({ message: "Session updated", session: updated });
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  }

  async getAgoraToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const sessionId = req.params.id;
      const userId = req.id;

      const session = await sessionService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      const now = new Date();
      const isValidTime =
        now >= new Date(session.startTime) &&
        now <=
          new Date(session.endTime ?? new Date(now.getTime() + 60 * 60 * 1000));

      // if (!isValidTime) {
      //   res.status(403).json({ message: "Session is not active yet" });
      //   return;
      // }

      const channelName = `session_${sessionId}`;
      const token = generateAgoraToken(channelName, userId);

      res.json({ token, channelName, appId: process.env.AGORA_APP_ID });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate token" });
    }
  }
}
