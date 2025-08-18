import { Request, Response } from "express";
import { SessionService } from "../services/session.service";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import mongoose from "mongoose";
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

      console.log(req.body)

      const dto = mapToCreateSessionDTO(req.body, req.id);
      if (dto.type === 'private' || dto.mentorId) {
        dto.status = 'pending';
      } else {
        dto.status = 'upcoming';
      }
      
      const newSession = await this.sessionService.createSession(dto);

      res.status(201).json({ message: "Session created", session: newSession });
    } catch (error) {
      console.error(error);
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
          } 
          else if (
            (session.status === "upcoming" || session.status === "accepted") &&
            now > end
          ) {
            session.status = "completed";
            await this.sessionService.updateSession(session._id, {
              status: "completed",
            });
          }
          else if (
            session.status === "accepted" &&
            now >= start &&
            now <= end
          ) {
          }

          return session;
        })
      );

      res.status(200).json({ sessions });
    } catch (error) {
      console.error(error);
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
    } catch (error) {
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
      const userId = req.id;

      const currentSession = await this.sessionService.getSessionById(sessionId);
      if (!currentSession) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      const isCreator = currentSession.createdBy.toString() === userId;
      const isParticipant = currentSession.participants.some(
        (p: any) => p.toString() === userId
      );
      const isMentor = currentSession.mentorId?.toString() === userId;

      if (!isCreator && !isParticipant && !isMentor) {
        res.status(403).json({ message: "Not authorized to update this session" });
        return;
      }

      const allowedStatusTransitions: Record<string, string[]> = {
        pending: ['accepted', 'cancelled'],
        upcoming: ['cancelled', 'completed'],
        accepted: ['cancelled', 'completed'],
        completed: [], 
        cancelled: [], 
      };

      const dto = mapToUpdateSessionDTO(req.body);
      
      if (dto.status && dto.status !== currentSession.status) {
        const allowedTransitions = allowedStatusTransitions[currentSession.status];
        if (!allowedTransitions.includes(dto.status)) {
          res.status(400).json({ 
            message: `Cannot change status from ${currentSession.status} to ${dto.status}` 
          });
          return;
        }

        if (dto.status === 'accepted' && currentSession.status === 'pending') {
          if (isCreator && !isParticipant && !isMentor) {
            res.status(403).json({ 
              message: "Only participants can accept pending sessions" 
            });
            return;
          }
        }
      }

      const updated = await this.sessionService.updateSession(sessionId, dto);
      res.status(200).json({ message: "Session updated", session: updated });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update session" });
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

      const sessionId = req.params.id;
      const userId = req.id;

      const session = await this.sessionService.getSessionById(sessionId);
      if (!session) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      const isCreator = session.createdBy.toString() === userId;
      const isParticipant = session.participants.some(
        (p: any) => p.toString() === userId
      );
      const isMentor = session.mentorId?.toString() === userId;

      if (!isCreator && !isParticipant && !isMentor) {
        res.status(403).json({ message: "Not authorized to join this session" });
        return;
      }

      if (session.status !== 'accepted' && session.status !== 'upcoming') {
        res.status(403).json({ 
          message: `Session is ${session.status}. Only accepted sessions can be joined.` 
        });
        return;
      }

      const now = new Date();
      const start = new Date(session.startTime);
      const end = new Date(
        session.endTime || 
        new Date(start.getTime() + (session.durationMinutes || 60) * 60000)
      );

      const isValidTime = now >= start && now <= end;

      if (!isValidTime) {
        if (now < start) {
          res.status(403).json({ message: "Session has not started yet" });
        } else {
          res.status(403).json({ message: "Session has ended" });
        }
        return;
      }

      const channelName = `session_${sessionId}`;
      const uid = userId.toString();
      const token = generateAgoraToken(channelName, uid);
      
      res.json({ 
        token, 
        channelName, 
        appId: process.env.AGORA_APP_ID, 
        uid 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate token" });
    }
  };
  getPublicSessions = async(req:Request,res:Response):Promise<void> => {
    try {
      let publicSessions = await this.sessionService.publicSessions();

       if (!publicSessions) {
        res.status(404).json({ message: "No sessions found" });
        return;
      }

      res.status(200).json({publicSessions})
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  }
}