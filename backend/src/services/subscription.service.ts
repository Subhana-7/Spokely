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

import {
  MESSAGES,
  SUBSCRIPTION_STATUS,
  PLAN_TYPES,
  NOTIFICATION_TYPE,
  SUBSCRIPTION_STRINGS,
  SESSION_TYPE,
  SESSION_STATUS,
  SESSION_AUTO_CREATE_STRINGS,
  CRON_STRINGS,
} from "../utilis/constants";

import { IChatRepository } from "../repositories/interfaces/IChatRepository";
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
    @inject(TYPES.IChatRepository)
    private _chatRepository: IChatRepository,
    @inject(TYPES.IWalletService)
    private readonly _walletService: IWalletService,
    @inject(TYPES.INotificationService)
    private _notificationService: INotificationService
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
      throw new Error(SUBSCRIPTION_STRINGS.ERRORS.CREATE_FAILED);
    }

    if (dto.price === undefined) {
      throw new Error(SUBSCRIPTION_STRINGS.ERRORS.PRICE_MISSING);
    }

    const userId = dto.userId.toString();
    const mentorId = dto.mentorId.toString();

    const participants = [userId, mentorId].sort();

    const sessionId = participants.join("_");

    await this._chatRepository.findOrCreateSession(sessionId, participants);

    await this._walletService.credit(
      dto.mentorId,
      dto.price,
      SUBSCRIPTION_STRINGS.PAYMENT_DESCRIPTION,
      undefined,
      subscription._id?.toString()
    );

    await this._notificationService.send({
      userId: dto.mentorId,
      title: SUBSCRIPTION_STRINGS.NOTIFICATIONS.TITLE,
      message: SUBSCRIPTION_STRINGS.NOTIFICATIONS.MESSAGE,
      type: NOTIFICATION_TYPE.SUCCESS,
    });

    return subscription;
  }

  getUserSubscriptions(
    userId: string,
    search: string,
    status: string,
    page: number,
    limit: number
  ) {
    return this._subscriptionRepository.findByUser(
      userId,
      search,
      status,
      page,
      limit
    );
  }

  getMentorSubscriptions(mentorId: string, search = "", page = 1, limit = 9) {
    return this._subscriptionRepository.findByMentorPaginated(
      mentorId,
      search,
      page,
      limit
    );
  }

  cancelSubscription(subscriptionId: string) {
    return this._subscriptionRepository.cancelSubscription(subscriptionId);
  }

  async saveMentorPlans(raw: any) {
    const dto: SetMentorPlansDTO = mapToSetMentorPlansDTO(raw);
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
      console.log(CRON_STRINGS.DAILY_SUBSCRIPTION_JOB);

      const subscriptions = await this._subscriptionRepository.findActive();

      for (const sub of subscriptions) {
        if (sub.status !== SUBSCRIPTION_STATUS.ACTIVE) continue;

        const today = new Date();
        let shouldCreate = false;

        switch (sub.plan) {
          case PLAN_TYPES.DAILY:
            shouldCreate = true;
            break;
          case PLAN_TYPES.WEEKLY:
            shouldCreate = today.getDay() === 1;
            break;
          case PLAN_TYPES.BIWEEKLY:
            shouldCreate = today.getDate() % 14 === 0;
            break;
          case PLAN_TYPES.TRIWEEKLY:
            shouldCreate = today.getDate() % 7 === 0;
            break;
        }

        if (!shouldCreate) continue;

        const hour24 = this.convertTo24Hour(sub.time);

        const sessionStartTime = new Date(today);
        sessionStartTime.setHours(hour24, 0, 0, 0);

        await this._sessionRepository.createSession({
          mentorId: sub.mentorId,
          participants: [
            {
              user: sub.userId,
              status: SESSION_STATUS.ACCEPTED,
            },
          ],
          startTime: sessionStartTime,
          type: SESSION_TYPE.PRIVATE,
          topic: SESSION_AUTO_CREATE_STRINGS.TOPIC,
          description: SESSION_AUTO_CREATE_STRINGS.DESCRIPTION,
          createdBy: sub.mentorId,
          createdByModel: SESSION_AUTO_CREATE_STRINGS.CREATED_BY_MODEL,
        });
      }
    });

    // "5 0 * * *"
    cron.schedule("* * * * *", async () => {
      const expiredCount =
        await this._subscriptionRepository.expireEndedSubscriptions();

      if (expiredCount > 0) {
        console.log(`Expired ${expiredCount} subscriptions`);
      }
    });
  }

  async getSubscriptionHistory(
    userId: string,
    search: string = "",
    status: string = "All",
    page: number = 1,
    limit: number = 10
  ) {
    return this._subscriptionRepository.findSubscriptionHistory(
      userId,
      search,
      status,
      page,
      limit
    );
  }

  async renewSubscription(subscriptionId: string) {
    const subscription = await this._subscriptionRepository.findById(
      subscriptionId
    );

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== SUBSCRIPTION_STATUS.EXPIRED) {
      throw new Error("Only expired subscriptions can be renewed");
    }

    const startDate = new Date();
    let endDate = new Date(startDate);

    switch (subscription.plan) {
      case PLAN_TYPES.DAILY:
        endDate.setDate(endDate.getDate() + 1);
        break;
      case PLAN_TYPES.WEEKLY:
        endDate.setDate(endDate.getDate() + 7);
        break;
      case PLAN_TYPES.BIWEEKLY:
        endDate.setDate(endDate.getDate() + 14);
        break;
      case PLAN_TYPES.TRIWEEKLY:
        endDate.setDate(endDate.getDate() + 21);
        break;
    }

    const updated = await this._subscriptionRepository.renewSubscription(
      subscriptionId,
      startDate,
      endDate
    );

    await this._notificationService.send({
      userId: subscription.userId.toString(),
      title: "Subscription Renewed",
      message: "Your subscription is active again 🎉",
      type: NOTIFICATION_TYPE.SUCCESS,
    });

    return updated;
  }
}
