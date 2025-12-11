import { ISubscription } from "../../models/subscription.modal";
import { IBaseRepository } from "./IBaseRepository";

export interface ISubscriptionRepository extends IBaseRepository<ISubscription> {
  createSubscription(
    data: Partial<ISubscription>
  ): Promise<ISubscription | null>;

  // findByUser(userId: string): Promise<ISubscription[]>;

  findByUser(
  userId: string,
  search: string,
  status: string,
  page: number,
  limit: number,
):Promise<any>;

  findByMentor(mentorId: string): Promise<ISubscription[]>;
  cancelSubscription(subscriptionId: string): Promise<ISubscription | null>;
  getMentorSelectedPlans(mentorId: string): Promise<ISubscription[] | null>;
  findActive(): Promise<ISubscription[]>;

  findSubscriptionHistory(
    userId: string,
    search: string,
    status: string,
    page :number,
    limit :number,
  ) :Promise<any>;

  findByMentorPaginated(
  mentorId: string,
  search: string,
  page: number,
  limit: number,
):Promise<any>;
}
