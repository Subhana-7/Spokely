import { Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IDailyTaskService } from "../services/interfaces/IDailyTaskService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";

@injectable()
export class DailyTaskController {
  constructor(@inject(TYPES.IDailyTaskService) private readonly _dailyTaskService: IDailyTaskService) {}

  createDailyTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { topic } = req.body;
      const userId = req.id!;
      const task = await this._dailyTaskService.createDailyTask({ userId, topic });
      res.status(200).json({ task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create daily task" });
    }
  };

  addUserResponse = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId, type, userResponse } = req.body;
      const task = await this._dailyTaskService.addUserResponse(taskId, type, userResponse);
      res.status(200).json({ task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add user response" });
    }
  };

  submitAll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, responses } = req.body;
    const task = await this._dailyTaskService.submitAll(taskId, responses, req.id!);
    res.status(200).json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit all tasks" });
  }
};

}
