import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticatedRequest";

export interface IDailyTaskController {
  createDailyTask(req: AuthenticatedRequest, res: Response): Promise<void>;
  addUserResponse(req: AuthenticatedRequest, res: Response): Promise<void>;
  submitAll(req: AuthenticatedRequest, res: Response): Promise<void>;
  getUserLatestTask(req: AuthenticatedRequest, res: Response): Promise<void>;
}
