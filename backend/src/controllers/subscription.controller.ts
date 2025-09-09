import { Request, Response } from "express";
import { ISubscriptionService } from "../services/interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";

@injectable()
export class SubscriptionController {
  constructor(
    @inject(TYPES.ISubscriptionService) private subscriptionService: ISubscriptionService
  ) {}

  async subscribe(req: Request, res: Response) {
    try {
      const { mentorId, plan, price, userId } = req.body;

      if (!userId || !mentorId || !plan || !price) {
        return res.status(400).json({ message: "Missing subscription data" });
      }

      const subscription = await this.subscriptionService.subscribe(userId, mentorId, plan, price);
      res.json({ success: true, subscription });
    } catch (err) {
      res.status(500).json({ success: false, message: "Subscription failed", err });
    }
  }

  async getUserSubscriptions(req: Request, res: Response) {
    const subs = await this.subscriptionService.getUserSubscriptions(req.params.id);
    res.json(subs);
  }

  async getMentorSubscriptions(req: Request, res: Response) {
    const subs = await this.subscriptionService.getMentorSubscriptions(req.params.id);
    res.json(subs);
  }

  async cancelSubscription(req: Request, res: Response) {
    const { id } = req.params;
    const sub = await this.subscriptionService.cancelSubscription(id);
    res.json(sub);
  }

  async getMentorPlans(req: Request, res: Response) {
    try {
      const mentorId = req.params.id;
      const plans = await this.subscriptionService.getMentorPlans(mentorId);

      if (!plans || plans.length === 0) {
        return res.json({ message: "mentor has no subscription", plans: [] });
      }

      res.json(plans);
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch plans" });
    }
  }

   async setMentorPlans(req: Request, res: Response) {
    try {
      const { mentorId, plans } = req.body;
      if (!mentorId || !plans) {
        return res.status(400).json({ message: "Missing data" });
      }

      const result = await this.subscriptionService.saveMentorPlans(mentorId, plans);
      res.json({ success: true, plans: result });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to save mentor plans" });
    }
  }
}
