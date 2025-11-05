import { ISubscriptionService } from "./interfaces/ISubscriptionService";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISubscriptionRepository } from "../repositories/interfaces/ISubscriptionRepository";
import cron from "node-cron";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { Types } from "mongoose";
import { IMentorPlanRepository } from "../repositories/interfaces/IMentorPlanRepository";
import {
  CreateSubscriptionDTO,
  SetMentorPlansDTO,
} from "../dto/subscription.dto";
import {
  mapToCreateSubscriptionDTO,
  mapToSetMentorPlansDTO,
} from "../mappers/subscription.mapper";
import { STATUS_CODES } from "../utilis/constants";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { privateDecrypt } from "crypto";
import session from "express-session";
import { IWalletService } from "./interfaces/IWalletService";
import { INotificationService } from "./interfaces/INotificationService";

@injectable()
export class SubscriptionService implements ISubscriptionService {
  constructor(
    @inject(TYPES.ISubscriptionRepository)
    private _subscriptionRepository: ISubscriptionRepository,
    @inject(TYPES.ISessionRepository)
    private _sessionRepository: ISessionRepository,
    @inject(TYPES.IMentorPlanRepository)
    private _mentorPlanRepository: IMentorPlanRepository,
    @inject(TYPES.IChatRepository) private _chatRepository: IChatRepository,
    @inject(TYPES.IWalletService)
    private readonly _walletService: IWalletService,
    @inject(TYPES.INotificationService) private _notificationService:INotificationService,
  ) {}

  async subscribe(raw: any) {
    const dto: CreateSubscriptionDTO = mapToCreateSubscriptionDTO(raw);

    const subscription = await this._subscriptionRepository.createSubscription({
      userId: new Types.ObjectId(dto.userId),
      mentorId: new Types.ObjectId(dto.mentorId),
      plan: dto.plan,
      price: dto.price,
      time: dto.time,
    });

    if (!subscription) {
      throw new Error("Failed to create subscription");
    }

    if (dto.price === undefined) {
      throw new Error("Subscription price is not defined");
    }

    await this._walletService.credit(
      dto.mentorId,
      dto.price,
      `Subscription payment from user ${dto.userId}`,
      undefined,
      subscription._id?.toString()
    );

    await this._notificationService.send({
      userId:dto.mentorId,
      title:"New Student Subscription",
      message:"A new student has subscribed to you. Congratulations.",
      type:"success",
    })

    return subscription;
  }

  getUserSubscriptions(
  userId: string,
  search: string,
  status: string,
  page: number,
  limit: number
) {
  return this._subscriptionRepository.findByUser(userId, search, status, page, limit);
}


  getMentorSubscriptions(mentorId: string) {
    return this._subscriptionRepository.findByMentor(mentorId);
  }

  cancelSubscription(subscriptionId: string) {
    return this._subscriptionRepository.cancelSubscription(subscriptionId);
  }

  async saveMentorPlans(raw: any) {
    // console.log(raw,'service')
    const dto: SetMentorPlansDTO = mapToSetMentorPlansDTO(raw);

    // console.log(this.saveMentorPlans);

    return this._mentorPlanRepository.savePlans(dto.mentorId, dto.plans);
  }

  async getMentorPlans(mentorId: string) {
    const plans = await this._mentorPlanRepository.getPlans(mentorId);

    if (!plans || plans.length === 0) {
      return [];
    }

    return plans;
  }

  convertTo24Hour(hour: number): number {
    if (hour >= 1 && hour <= 8) return hour + 12;
    return hour;
  }

  scheduleCronJobs() {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running daily subscription cron...");

      const subscriptions = await this._subscriptionRepository.findActive();

      console.log(subscriptions);

      for (const sub of subscriptions) {
        if (sub.status !== "ACTIVE") continue;

        const today = new Date();
        let shouldCreate = false;

        switch (sub.plan) {
          case "DAILY":
            shouldCreate = true;
            break;
          case "WEEKLY":
            shouldCreate = today.getDay() === 1;
            break;
          case "BIWEEKLY":
            shouldCreate = today.getDate() % 14 === 0;
            break;
          case "TRIWEEKLY":
            shouldCreate = today.getDate() % 7 === 0;
            break;
        }

        if (!shouldCreate) continue;

        const hour24 = this.convertTo24Hour(sub.time);

        const sessionStartTime = new Date(today);
        sessionStartTime.setHours(hour24, 0, 0, 0);

        console.log(sessionStartTime);

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

  async getSubscriptionHistory(userId: string, page: number, limit: number) {
  return this._subscriptionRepository.findSubscriptionHistory(userId, page, limit);
}

}
