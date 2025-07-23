import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";

export interface ISessionController {
  createSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAllSessions(req: AuthenticatedRequest, res: Response): Promise<void>;
  getSessionById(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAgoraToken(req: AuthenticatedRequest, res: Response): Promise<void>;
}
