import { IMentorPlan } from "../../models/mentorPlan.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IMentorPlanRepository extends IBaseRepository<IMentorPlan> {
  savePlans(mentorId: string, plans: any[]): Promise<IMentorPlan | null>;
  getPlans(mentorId: string): Promise<IMentorPlan["plans"]>;
}