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

      const dto = mapToCreateSessionDTO(req.body, req.id);
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
      const sessions = await this.sessionService.getSessions();
      res.status(200).json(sessions);
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
      const dto = mapToUpdateSessionDTO(req.body);
      const updated = await this.sessionService.updateSession(
        req.params.id,
        dto
      );
      res.status(200).json({ message: "Session updated", session: updated });
    } catch (error) {
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
  };
}
