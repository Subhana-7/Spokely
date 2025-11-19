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

  async findByUser(
  userId: string,
  search: string = "",
  status: string = "All",
  page: number = 1,
  limit: number = 10
) {
    const query: any = { userId };

  if (status !== "All") query.status = status;

  const skip = (page - 1) * limit;

  const subscriptions = await SubscriptionModel.find(query)
    .populate({
      path: "mentorId",
      model: "Mentor",
      select: "name email bio profilePicture sessionsDone tags",
    })
    .lean();

  const searched = subscriptions.filter((sub: any) => {
    const mentor = sub.mentorId;
    if (!mentor) return false;

    const searchLower = search.toLowerCase();
    return (
      mentor.name.toLowerCase().includes(searchLower) ||
      sub._id.toString().includes(searchLower)
    );
  });

  const total = searched.length;
  const paginated = searched.slice(skip, skip + limit);

    const enriched = await Promise.all(
    paginated.map(async (sub: any) => {
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

         return { ...sub, mentor };
      })
    );
     return {
    data: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
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

  async findSubscriptionHistory(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const subscriptions = await this.model
    .find({ userId })
    .populate({
      path: "mentorId",
      model: "Mentor",
      select: "name email profilePicture",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await this.model.countDocuments({ userId });
  const totalPages = Math.ceil(total / limit);

  const formatted = subscriptions.map((sub: any) => ({
    id: sub._id,
    planName: sub.plan,
    price: sub.price,
    startDate: sub.startDate,
    endDate: sub.endDate,
    status: sub.status,
    sessions: sub.sessionsCount || 0,
    mentor: sub.mentorId
      ? {
          id: sub.mentorId._id,
          name: sub.mentorId.name,
          profilePicture: sub.mentorId.profilePicture,
        }
      : null,
  }));

  return {
    data: formatted,
    total,
    page,
    totalPages,
  };
}


async findByMentorPaginated(
  mentorId: string,
  search: string = "",
  page: number = 1,
  limit: number = 9
) {
  const skip = (page - 1) * limit;

  const query: any = { mentorId };

  const allSubs = await SubscriptionModel.find(query)
    .populate({
      path: "userId",
      model: "User",
      select: "name email profilePicture",
    })
    .sort({ createdAt: -1 })
    .lean();

  const filtered = allSubs.filter((sub: any) => {
    const user = sub.userId;
    if (!user) return false;
    const searchLower = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  const enriched = await Promise.all(
    paginated.map(async (sub: any) => {
      const user = sub.userId;
      if (!user || !user._id) {
        return {
          ...sub,
          user: null,
          sessionsCount: 0,
          avgRating: null,
        };
      }

      const userId = user._id;

      const sessions = await SessionModel.find({
        mentorId,
        $or: [{ createdBy: userId }, { "participants.user": userId }],
        status: "completed",
      }).populate("feedback.from feedback.to", "name email");

      const feedbackByMentor = sessions
        .flatMap((s) => s.feedback || [])
        .filter(
          (fb) =>
            fb.from?.toString() === mentorId.toString() &&
            fb.to?.toString() === userId.toString()
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
        avgRating,
      };
    })
  );

  return {
    data: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}


}
