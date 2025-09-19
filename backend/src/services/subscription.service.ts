import { ISubscriptionService } from "./interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import cron from "node-cron";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { Types } from "mongoose";
import { IMentorPlanRepository } from "../repositories/interfaces/IMentorPlanRepository";
import { CreateSubscriptionDTO, SetMentorPlansDTO } from "../dto/subscription.dto";
import {
  mapToCreateSubscriptionDTO,
  mapToSetMentorPlansDTO,
} from "../mappers/subscription.mapper";

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.ISubscriptionRepository)
    private _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.ISessionRepository)
    private _sessionRepository: ISessionRepository,
    @inject(TYPES.IMentorPlanRepository)
    private _mentorPlanRepository: IMentorPlanRepository
  ) {}

  async subscribe(raw: any) {
    const dto: CreateSubscriptionDTO = mapToCreateSubscriptionDTO(raw);

    return this._subscriptionRepository.createSubscription({
      userId: new Types.ObjectId(dto.userId),
      mentorId: new Types.ObjectId(dto.mentorId),
      plan: dto.plan,
      price: dto.price,
    });
  }

  getUserSubscriptions(userId: string) {
    return this._subscriptionRepository.findByUser(userId);
  }

  getMentorSubscriptions(mentorId: string) {
    return this._subscriptionRepository.findByMentor(mentorId);
  }

  cancelSubscription(subscriptionId: string) {
    return this._subscriptionRepository.cancelSubscription(subscriptionId);
  }

  async saveMentorPlans(raw: any) {
    const dto: SetMentorPlansDTO = mapToSetMentorPlansDTO(raw);
    return this._mentorPlanRepository.savePlans(dto.mentorId, dto.plans);
  }

  async getMentorPlans(mentorId: string) {
    return this._mentorPlanRepository.getPlans(mentorId);
  }

  scheduleCronJobs() {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running daily subscription cron...");

      const subscriptions = await this._subscriptionRepository.findActive();

      for (const sub of subscriptions) {
        if (sub.status !== "ACTIVE") continue;

        let shouldCreate = false;
        const today = new Date();

        switch (sub.plan) {
          case "DAILY":
            shouldCreate = true;
            break;
          case "WEEKLY":
            shouldCreate = today.getDay() === 1; // Monday
            break;
          case "BIWEEKLY":
            shouldCreate = today.getDate() % 14 === 0;
            break;
          case "TRIWEEKLY":
            shouldCreate = today.getDate() % 7 === 0;
            break;
        }

        if (!shouldCreate) continue;

        const sessionStartTime = new Date(today);
        sessionStartTime.setHours(12, 0, 0, 0);

        await this._sessionRepository.createSession({
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
