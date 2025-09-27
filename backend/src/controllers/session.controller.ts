import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { ISessionController } from "./interfaces/ISessionController";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionService } from "../services/interfaces/ISessionService";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class SessionController implements ISessionController {
  constructor(
    @inject(TYPES.ISessionService)
    private readonly _sessionService: ISessionService
  ) {}

  createSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const newSession = await this._sessionService.createSession(req.body, req.id);
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.SESSION.CREATED, session: newSession });
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.CREATE_FAILED });
    }
  };

  getAllSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) throw new Error(MESSAGES.ERROR.UNAUTHORIZED);
      const sessions = await this._sessionService.getSessions(req.id);
      
      res.status(STATUS_CODES.OK).json({ sessions });
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.FETCH_FAILED });
    }
  };

  getSessionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await this._sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.SESSION.NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json(session);
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.FETCH_FAILED });
    }
  };

  updateSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const updated = await this._sessionService.updateSession(req.params.id, req.body);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SESSION.UPDATED, session: updated });
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.UPDATE_FAILED });
    }
  };

  respondToInvite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this._sessionService.respondToInvite(req.params.id, req.id!, req.body.status);
      res.status(STATUS_CODES.OK).json({ message: `Session ${req.body.status}`, session: updated });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  cancelParticipation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this._sessionService.cancelParticipation(req.params.id, req.id!, req.body.reason);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SESSION.PARTICIPATION_CANCELLED, session: updated });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  cancelSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this._sessionService.cancelSession(req.params.id, req.body.userId, req.body.reason);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SESSION.CANCELLED, session: updated });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  flagSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this._sessionService.flagSession(req.params.id, req.id!, req.body.reason, req.body.againstUser);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SESSION.FLAGGED, session: updated });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAgoraToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.id) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
        return;
      }
      const tokenData = await this._sessionService.getAgoraToken(req.params.id, req.id);
      if (!tokenData) {
        res.status(STATUS_CODES.FORBIDDEN).json({ message: MESSAGES.SESSION.OUTSIDE_TIMEFRAME });
        return;
      }
      res.status(STATUS_CODES.OK).json(tokenData);
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.TOKEN_FAILED });
    }
  };

  getPublicSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const publicSessions = await this._sessionService.publicSessions();
      if (!publicSessions || publicSessions.length === 0) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.SESSION.NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json({ publicSessions });
    } catch {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.SESSION.FETCH_FAILED });
    }
  };

  addFeedback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await this._sessionService.addFeedback(req.params.id, req.id!, req.body.to, req.body.comment, req.body.rating);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.SESSION.FEEDBACK_ADDED, session: updated });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAllSessionsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessions = await this._sessionService.getAllSessionsAdmin(req.query);
      if (!sessions || sessions.length === 0) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.SESSION.NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json({ sessions });
    } catch (err: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };

  getSessionDetailsAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await this._sessionService.getSessionById(req.params.id);
      if (!session) {
        res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.SESSION.NOT_FOUND });
        return;
      }
      res.status(STATUS_CODES.OK).json({ session });
    } catch (err: any) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: err.message });
    }
  };
}
