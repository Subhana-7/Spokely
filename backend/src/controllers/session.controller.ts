import { Request, Response } from "express";
import { SessionService } from "../services/session.service";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import mongoose from "mongoose";

export const SessionController = {
  createSession: async (req: AuthenticatedRequest, res: Response) => {
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

      const newSession = await SessionService.createSession({
        type, 
        topic,
        description,
        mentorId: mentorId ? new mongoose.Types.ObjectId(mentorId) : undefined,
        startTime,
        endTime,
        createdBy: new mongoose.Types.ObjectId(req.id), // Convert to ObjectId
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
  },

  getAllSessions: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessions = await SessionService.getSessions();
      res.status(200).json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  },

  getSessionById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const session = await SessionService.getSessionById(req.params.id);
      res.status(200).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  },

  updateSession: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = await SessionService.updateSession(
        req.params.id,
        req.body
      );
      res.status(200).json({ message: "Session updated", session: updated });
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  },
};
