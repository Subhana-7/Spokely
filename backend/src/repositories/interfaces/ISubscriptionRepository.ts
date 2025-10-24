import { ISubscription } from "../../models/subscription.modal";

export interface ISubscriptionRepository {
  createSubscription(
    data: Partial<ISubscription>
  ): Promise<ISubscription | null>;
  findByUser(userId: string): Promise<ISubscription[]>;
  findByMentor(mentorId: string): Promise<ISubscription[]>;
  cancelSubscription(subscriptionId: string): Promise<ISubscription | null>;
  getMentorSelectedPlans(mentorId: string): Promise<ISubscription[] | null>;
  findActive(): Promise<ISubscription[]>;
}
