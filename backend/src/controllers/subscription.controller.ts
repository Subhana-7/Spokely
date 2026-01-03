import { Request, Response } from "express";
import { ISubscriptionService } from "../services/interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionController } from "./interfaces/ISubscriptionController";
import { STATUS_CODES, MESSAGES, SUBSCRIPTION_MESSAGES } from "../utilis/constants";

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject(TYPES.ISubscriptionService)
    private _subscriptionService: ISubscriptionService
  ) {}

  private getErrorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback;
  }

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      console.log('cont',req.body)
      const subscription = await this._subscriptionService.subscribe(req.body);
      console.log('cont after',subscription)

      res.status(STATUS_CODES.OK).json({ success: true, subscription });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(err, MESSAGES.ERROR.SUBSCRIPTION_FAILED),
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(
          err,
          SUBSCRIPTION_MESSAGES.ERROR.FAILED_TO_FETCH
        ),
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
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(
          err,
          MESSAGES.ERROR.FETCH_MENTOR_STUDENT
        ),
      });
    }
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const sub = await this._subscriptionService.cancelSubscription(id);

      res.status(STATUS_CODES.OK).json(sub);
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(err, MESSAGES.ERROR.SUBSCRIPTION_FAILED),
      });
    }
  }

  async getMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const mentorId = req.params.id;

      const plans = await this._subscriptionService.getMentorPlans(mentorId);

      res.status(STATUS_CODES.OK).json(plans);
    } catch (err: unknown) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: this.getErrorMessage(err, MESSAGES.ERROR.SUBSCRIPTION_FAILED),
      });
    }
  }

  async setMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const result = await this._subscriptionService.saveMentorPlans(req.body);

      res.status(STATUS_CODES.OK).json({ success: true, plans: result });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(err, MESSAGES.ERROR.SUBSCRIPTION_FAILED),
      });
    }
  }

    async getSubscriptionHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { page = "1", limit = "10", search = "", status = "All" } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await this._subscriptionService.getSubscriptionHistory(
        userId,
        search as string,
        status as string,
        pageNum,
        limitNum
      );

      res.status(STATUS_CODES.OK).json({
        success: true,
        ...result,
      });
    } catch (err: unknown) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: this.getErrorMessage(
          err,
          MESSAGES.ERROR.FETCH_SUBSCRIPTION_HISTORY
        ),
      });
    }
  }

  async renewSubscription(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await this._subscriptionService.renewSubscription(id);

    res.status(STATUS_CODES.OK).json({
      success: true,
      subscription: result,
    });
  } catch (err: unknown) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: this.getErrorMessage(
        err,
        SUBSCRIPTION_MESSAGES.ERROR.RENEW_FAILED
      ),
    });
  }
}

}
