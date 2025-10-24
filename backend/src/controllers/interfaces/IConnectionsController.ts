import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";

export interface IConnectionController {
  sendRequest(req: AuthenticatedRequest, res: Response): Promise<void>;
  getRequests(req: AuthenticatedRequest, res: Response): Promise<void>;
  acceptConnection(req: AuthenticatedRequest, res: Response): Promise<void>;
  listConnections(req: AuthenticatedRequest, res: Response): Promise<void>;
  getSentRequests(req: AuthenticatedRequest, res: Response): Promise<void>;

  blockConnection(req: AuthenticatedRequest, res: Response): Promise<void>;

  unblockConnection(req: AuthenticatedRequest, res: Response): Promise<void>;

  removeConnection(req: AuthenticatedRequest, res: Response): Promise<void>;
}
