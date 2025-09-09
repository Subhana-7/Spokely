import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";

export interface IChatController {
  getMessages(req: AuthenticatedRequest, res: Response): Promise<void>;
  sendMessage(req: AuthenticatedRequest, res: Response): Promise<void>;
}
