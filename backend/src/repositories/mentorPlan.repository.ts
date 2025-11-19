import MentorPlanModel, { IMentorPlan } from "../models/mentorPlan.model";
import { injectable } from "inversify";
import { IMentorPlanRepository } from "./interfaces/IMentorPlanRepository";
import { BaseRepository } from "./base.repository";

@injectable()
export class MentorPlanRepository
  extends BaseRepository<IMentorPlan>
  implements IMentorPlanRepository
{
  constructor() {
    super(MentorPlanModel);
  }

  async savePlans(mentorId: string, plans: any[]) {
    try {
      console.log("heh");
      return MentorPlanModel.findOneAndUpdate(
        { mentorId },
        { mentorId, plans },
        { upsert: true, new: true }
      );
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async getPlans(mentorId: string): Promise<IMentorPlan["plans"]> {
    try {
      const record = await MentorPlanModel.findOne({ mentorId });
      return record ? record.plans : [];
    } catch (error:unknown) {
      console.log("error", error);
      return [];
    }
  }
}
