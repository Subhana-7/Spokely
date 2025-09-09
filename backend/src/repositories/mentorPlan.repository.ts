import MentorPlanModel, { IMentorPlan } from "../models/mentorPlan.model";
import { injectable } from "inversify";
import { IMentorPlanRepository } from "./interfaces/IMentorPlanRepository";

@injectable()
export class MentorPlanRepository implements IMentorPlanRepository {
  async savePlans(mentorId: string, plans: any[]) {
    return MentorPlanModel.findOneAndUpdate(
      { mentorId },
      { mentorId, plans },
      { upsert: true, new: true }
    );
  }

  async getPlans(mentorId: string): Promise<IMentorPlan["plans"]> {
    const record = await MentorPlanModel.findOne({ mentorId });
    return record ? record.plans : [];
  }
}
