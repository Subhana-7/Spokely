import { Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IDailyTaskService } from "../services/interfaces/IDailyTaskService";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { MESSAGES, STATUS_CODES,DAILY_TASK_MESSAGES } from "../utilis/constants";

@injectable()
export class DailyTaskController {
  constructor(
    @inject(TYPES.IDailyTaskService)
    private readonly _dailyTaskService: IDailyTaskService
  ) {}

  createDailyTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { topic } = req.body;
      const userId = req.id!;
      const task = await this._dailyTaskService.createDailyTask({
        userId,
        topic,
      });
      res.status(STATUS_CODES.OK).json({ task });
    } catch (err:unknown) {
      console.error(err);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  addUserResponse = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId, type, userResponse } = req.body;
      const task = await this._dailyTaskService.addUserResponse(
        taskId,
        type,
        userResponse
      );
      res.status(STATUS_CODES.OK).json({ task });
    } catch (err:unknown) {
      console.error(err);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  submitAll = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { taskId, responses } = req.body;
      const task = await this._dailyTaskService.submitAll(
        taskId,
        responses,
        req.id!
      );
      res.status(STATUS_CODES.OK).json({ task });
    } catch (err:unknown) {
      console.error(err);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  getUserLatestTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.id!;
      const task = await this._dailyTaskService.getUserLatestTask(userId);

      if (!task) {
        return res
          .status(STATUS_CODES.NOT_FOUND)
          .json({ message: DAILY_TASK_MESSAGES.ERROR.TODAYS_TASK_NOT_FOUND });
      }

      return res.status(STATUS_CODES.OK).json({ task });
    } catch (err:unknown) {
      console.error(err);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };
}
