import { ISubscription } from "../../models/subscription.modal";
import { IMentorPlan } from "../../models/mentorPlan.model";

export interface ISubscriptionService {
  subscribe(
    userId: string,
    mentorId: string,
    plan: ISubscription["plan"],
    price: number
  ): Promise<ISubscription | null>;

  getUserSubscriptions(userId: string): Promise<ISubscription[]>;
  getMentorSubscriptions(mentorId: string): Promise<ISubscription[]>;
  cancelSubscription(subscriptionId: string): Promise<ISubscription | null>;
  scheduleCronJobs(): Promise<void> | void;
  getMentorPlans(mentorId: string): Promise<IMentorPlan["plans"]>;
  saveMentorPlans(mentorId: string, plans: any[]): Promise<IMentorPlan | null>;
}
