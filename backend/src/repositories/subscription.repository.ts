import { ISubscriptionRepository } from "./interfaces/ISubscriptionRepository";
import SubscriptionModel, { ISubscription } from "../models/subscription.modal";
import { injectable } from "inversify";
import SessionModel from "../models/sessions.model";
import MentorModel from "../models/mentor.model";
import { BaseRepository } from "./base.repository";

@injectable()
export class SubscriptionRepository
  extends BaseRepository<ISubscription>
  implements ISubscriptionRepository
{
  constructor() {
    super(SubscriptionModel);
  }

  async createSubscription(
    data: Partial<ISubscription>
  ): Promise<ISubscription | null> {
    return await SubscriptionModel.create(data);
  }

  async findByUser(userId: string) {
    const subscriptions = await SubscriptionModel.find({ userId })
      .populate({
        path: "mentorId",
        model: "Mentor",
        select: "name email bio profilePicture sessionsDone tags",
      })
      .lean();

    const enriched = await Promise.all(
      subscriptions.map(async (sub: any) => {
        const mentor = sub.mentorId;
        if (!mentor || !mentor._id) {
          return {
            ...sub,
            mentor: null,
            sessionsCount: 0,
            sessionsByUser: 0,
            feedbackByUser: [],
            avgRating: null,
          };
        }

        const mentorId = mentor._id;

        const sessions = await SessionModel.find({
          mentorId,
          $or: [{ createdBy: userId }, { "participants.user": userId }],
          status: "completed",
        })
          .populate("feedback.from feedback.to", "name email")
          .lean();

        const sessionsByUser = sessions.filter(
          (s) => s.createdBy?.toString() === userId.toString()
        );

        const feedbackByUser = sessions
          .flatMap((s) => s.feedback || [])
          .filter(
            (fb) =>
              fb.from &&
              fb.to &&
              fb.from.toString() === userId.toString() &&
              fb.to.toString() === mentorId.toString()
          );

        const avgRating =
          feedbackByUser.length > 0
            ? feedbackByUser.reduce((acc, f) => acc + (f.rating || 0), 0) /
              feedbackByUser.length
            : null;

        return {
          ...sub,
          mentor,
          sessionsCount: sessions.length,
          sessionsByUser: sessionsByUser.length,
          feedbackByUser,
          avgRating,
        };
      })
    );
    return enriched;
  }

  async findByMentor(mentorId: string) {
    const subscriptions = await SubscriptionModel.find({ mentorId })
      .populate({
        path: "userId",
        model: "User",
        select: "name email profilePicture",
      })
      .lean();

    const enriched = await Promise.all(
      subscriptions.map(async (sub: any) => {
        const user = sub.userId;
        if (!user || !user._id) {
          return {
            ...sub,
            user: null,
            sessionsCount: 0,
            sessionsWithMentor: 0,
            feedbackByMentor: [],
            avgRating: null,
          };
        }

        const userId = user._id;

        const sessions = await SessionModel.find({
          mentorId,
          $or: [{ createdBy: userId }, { "participants.user": userId }],
          status: "completed",
        })
          .populate("feedback.from feedback.to", "name email")
          .lean();

        const sessionsWithMentor = sessions.filter(
          (s) => s.mentorId?.toString() === mentorId.toString()
        );

        const feedbackByMentor = sessions
          .flatMap((s) => s.feedback || [])
          .filter(
            (fb) =>
              fb.from &&
              fb.to &&
              fb.from.toString() === mentorId.toString() &&
              fb.to.toString() === userId.toString()
          );

        const avgRating =
          feedbackByMentor.length > 0
            ? feedbackByMentor.reduce((acc, f) => acc + (f.rating || 0), 0) /
              feedbackByMentor.length
            : null;

        return {
          ...sub,
          user,
          sessionsCount: sessions.length,
          sessionsWithMentor: sessionsWithMentor.length,
          feedbackByMentor,
          avgRating,
        };
      })
    );

    return enriched;
  }

  async cancelSubscription(subscriptionId: string) {
    return await SubscriptionModel.findByIdAndUpdate(
      subscriptionId,
      { status: "CANCELLED" },
      { new: true }
    );
  }

  async getMentorSelectedPlans(mentorId: string) {
    const mentorPlanMapping: Record<string, ISubscription[]> = {
      mentor1: [
        { plan: "DAILY", price: 500 } as any,
        { plan: "WEEKLY", price: 1500 } as any,
      ],
      mentor2: [{ plan: "BIWEEKLY", price: 2800 } as any],
    };

    return mentorPlanMapping[mentorId] || [];
  }

  async findActive() {
    return SubscriptionModel.find({ status: "ACTIVE" });
  }
}
