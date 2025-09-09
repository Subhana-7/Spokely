import { ISubscriptionService } from "./interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import cron from "node-cron";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { ISubscription } from "../models/subscription.modal";
import { Types } from "mongoose";
import { IMentorPlanRepository } from "../repositories/interfaces/IMentorPlanRepository";

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.ISubscriptionRepository)
    private subscriptionRepo: ISubscriptionRepository,
    @inject(TYPES.ISessionRepository) private sessionRepo: ISessionRepository,
    @inject(TYPES.IMentorPlanRepository)
    private mentorPlanRepo: IMentorPlanRepository
  ) {}

  subscribe(
    userId: string,
    mentorId: string,
    plan: ISubscription["plan"],
    price: number
  ) {
    return this.subscriptionRepo.createSubscription({
      userId: new Types.ObjectId(userId),
      mentorId: new Types.ObjectId(mentorId),
      plan,
      price,
    });
  }

  getUserSubscriptions(userId: string) {
    return this.subscriptionRepo.findByUser(userId);
  }

  getMentorSubscriptions(mentorId: string) {
    return this.subscriptionRepo.findByMentor(mentorId);
  }

  cancelSubscription(subscriptionId: string) {
    return this.subscriptionRepo.cancelSubscription(subscriptionId);
  }

  async saveMentorPlans(mentorId: string, plans: any[]) {
    return this.mentorPlanRepo.savePlans(mentorId, plans);
  }

  async getMentorPlans(mentorId: string) {
    return this.mentorPlanRepo.getPlans(mentorId);
  }

  scheduleCronJobs() {
    // Runs daily at 12:00 AM
    cron.schedule("0 0 * * *", async () => {
    // cron.schedule("*/2 * * * *", async () => {
      console.log("Running daily subscription cron...");

      const subscriptions = await this.subscriptionRepo.findActive();

      for (const sub of subscriptions) {
        if (sub.status !== "ACTIVE") continue;

        let shouldCreate = false;
        const today = new Date();

        switch (sub.plan) {
          case "DAILY":
            shouldCreate = true;
            break;
          case "WEEKLY":
            shouldCreate = today.getDay() === 1; // e.g., Monday
            break;
          case "BIWEEKLY":
            shouldCreate = today.getDate() % 14 === 0; // every 14 days
            break;
          case "TRIWEEKLY":
            shouldCreate = today.getDate() % 7 === 0; // e.g., Mon/Wed/Fri
            break;
        }

        const sessionStartTime = new Date(today);
        sessionStartTime.setHours(12, 0, 0, 0);

        await this.sessionRepo.createSession({
          mentorId: sub.mentorId,
          participants: [{ user: sub.userId, status: "accepted" }],
          startTime: sessionStartTime,
          type: "private",
          topic: "Subscription Session",
          description: "Auto-scheduled session",
          createdBy: sub.mentorId,
          createdByModel: "Mentor",
        });
      }
    });
  }
}
