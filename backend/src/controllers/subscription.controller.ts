import { Request, Response } from "express";
import { ISubscriptionService } from "../services/interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionController } from "./interfaces/ISubscriptionController";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject(TYPES.ISubscriptionService)
    private _subscriptionService: ISubscriptionService
  ) {}

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const subscription = await this._subscriptionService.subscribe(req.body);
      res.status(STATUS_CODES.OK).json({ success: true, subscription });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: err.message || MESSAGES.ERROR.SUBSCRIPTION_FAILED,
      });
    }
  }

  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.id;
    const { search = "", status = "All", page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await this._subscriptionService.getUserSubscriptions(
      userId,
      search as string,
      status as string,
      pageNum,
      limitNum
    );

    res.status(STATUS_CODES.OK).json(result);
  } catch (err: any) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: err.message || "Failed to fetch subscriptions",
    });
  }
}


  async getMentorSubscriptions(req: Request, res: Response): Promise<void> {
  try {
    const mentorId = req.params.id;
    const { search = "", page = "1", limit = "9" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await this._subscriptionService.getMentorSubscriptions(
      mentorId,
      search as string,
      pageNum,
      limitNum
    );

    res.status(STATUS_CODES.OK).json(result);
  } catch (err: any) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: err.message || "Failed to fetch mentor students",
    });
  }
}


  async cancelSubscription(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const sub = await this._subscriptionService.cancelSubscription(id);
    res.status(STATUS_CODES.OK).json(sub);
  }

  async getMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const mentorId = req.params.id;
      const plans = await this._subscriptionService.getMentorPlans(mentorId);

      res.status(STATUS_CODES.OK).json(plans);
    } catch (err) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: MESSAGES.ERROR.SUBSCRIPTION_FAILED });
    }
  }

  async setMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._subscriptionService.saveMentorPlans(req.body);
      res.status(STATUS_CODES.OK).json({ success: true, plans: result });
    } catch (err: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: err.message || MESSAGES.ERROR.SUBSCRIPTION_FAILED,
      });
    }
  }

  async getSubscriptionHistory(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.id;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await this._subscriptionService.getSubscriptionHistory(
      userId,
      pageNum,
      limitNum
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: err.message || "Failed to fetch subscription history",
    });
  }
}

}
