import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";
import SubscriptionModel, { ISubscription } from "../models/subscription.modal";
import { injectable } from "inversify";

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  async createSubscription(data: Partial<ISubscription>): Promise<ISubscription | null> {
    return await SubscriptionModel.create(data);
  }

  async findByUser(userId: string) {
    return await SubscriptionModel.find({ userId });
  }

  async findByMentor(mentorId: string) {
    return await SubscriptionModel.find({ mentorId });
  }

  async cancelSubscription(subscriptionId: string) {
    return await SubscriptionModel.findByIdAndUpdate(subscriptionId, { status: "CANCELLED" }, { new: true });
  }

  async getMentorSelectedPlans(mentorId: string) {
    const mentorPlanMapping: Record<string, ISubscription[]> = {
      "mentor1": [
        { plan: "DAILY", price: 500 } as any,
        { plan: "WEEKLY", price: 1500 } as any,
      ],
      "mentor2": [
        { plan: "BIWEEKLY", price: 2800 } as any,
      ],
    };

    return mentorPlanMapping[mentorId] || [];
  }

  async findActive() {
  return SubscriptionModel.find({ status: "ACTIVE" });
}
}
