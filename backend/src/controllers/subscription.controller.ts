import { Request, Response } from "express";
import { ISubscriptionService } from "../services/interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionController } from "./interfaces/ISubscriptionController";
import {
  mapToCreateSubscriptionDTO,
  mapToSetMentorPlansDTO,
} from "../mappers/subscription.mapper";

@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject(TYPES.ISubscriptionService)
    private subscriptionService: ISubscriptionService
  ) {}

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const dto = mapToCreateSubscriptionDTO(req.body);
      const subscription = await this.subscriptionService.subscribe(dto);
      res.json({ success: true, subscription });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Subscription failed",
      });
    }
  }

  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    const subs = await this.subscriptionService.getUserSubscriptions(
      req.params.id
    );
    res.json(subs);
  }

  async getMentorSubscriptions(req: Request, res: Response): Promise<void> {
    const subs = await this.subscriptionService.getMentorSubscriptions(
      req.params.id
    );
    res.json(subs);
  }

  async cancelSubscription(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const sub = await this.subscriptionService.cancelSubscription(id);
    res.json(sub);
  }

  async getMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const mentorId = req.params.id;
      const plans = await this.subscriptionService.getMentorPlans(mentorId);

      if (!plans || plans.length === 0) {
        res.json({ message: "mentor has no subscription", plans: [] });
      }

      res.json(plans);
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch plans" });
    }
  }

  async setMentorPlans(req: Request, res: Response): Promise<void> {
    try {
      const dto = mapToSetMentorPlansDTO(req.body);
      const result = await this.subscriptionService.saveMentorPlans(dto);
      res.json({ success: true, plans: result });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Failed to save mentor plans",
      });
    }
  }
}
