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
    const subs = await this._subscriptionService.getUserSubscriptions(
      req.params.id
    );
    res.status(STATUS_CODES.OK).json(subs);
  }

  async getMentorSubscriptions(req: Request, res: Response): Promise<void> {
    const subs = await this._subscriptionService.getMentorSubscriptions(
      req.params.id
    );
    res.status(STATUS_CODES.OK).json(subs);
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
}
