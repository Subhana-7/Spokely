import { IMentorPlan } from "../../models/mentorPlan.model";

export interface IMentorPlanRepository {
  savePlans(mentorId: string, plans: any[]):Promise<IMentorPlan>;
  getPlans(mentorId: string): Promise<IMentorPlan["plans"]>;
}