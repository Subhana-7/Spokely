import { ISubscription } from "../../models/subscription.modal";
import { IMentorPlan } from "../../models/mentorPlan.model";
import { CreateSubscriptionDTO, SetMentorPlansDTO } from "../../dto/subscription.dto";

export interface ISubscriptionService {
  subscribe(dto: CreateSubscriptionDTO): Promise<ISubscription | null>;
  getUserSubscriptions(userId: string): Promise<ISubscription[]>;
  getMentorSubscriptions(mentorId: string): Promise<ISubscription[]>;
  cancelSubscription(subscriptionId: string): Promise<ISubscription | null>;
  scheduleCronJobs(): Promise<void> | void;
  getMentorPlans(mentorId: string): Promise<IMentorPlan["plans"]>;
  saveMentorPlans(dto: SetMentorPlansDTO): Promise<IMentorPlan | null>;
}
