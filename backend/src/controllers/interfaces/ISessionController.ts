import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";

export interface ISessionController {
  createSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAllSessions(req: AuthenticatedRequest, res: Response): Promise<void>;
  getSessionById(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAgoraToken(req: AuthenticatedRequest, res: Response): Promise<void>;
  getPublicSessions(req: AuthenticatedRequest, res: Response): Promise<void>;

  // new flow specific
  respondToInvite(req: AuthenticatedRequest, res: Response): Promise<void>;
  cancelParticipation(req: AuthenticatedRequest, res: Response): Promise<void>;
  cancelSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  flagSession(req: AuthenticatedRequest, res: Response): Promise<void>;
}
