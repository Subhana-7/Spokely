import Mentor, { IMentor } from "../models/mentor.model";
import { IMentorRepository } from "./interfaces/IMentorRepository";
import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";
import mongoose from "mongoose";
import sessionsModel, { ISession } from "../models/sessions.model";
import subscriptionModal, { ISubscription } from "../models/subscription.modal";

@injectable()
export class MentorRepository
  extends BaseRepository<IMentor>
  implements IMentorRepository
{
  constructor() {
    super(Mentor);
  }

  async findByEmail(email: string): Promise<IMentor | null> {
    try {
      return Mentor.findOne({ email });
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async createMentor(data: Partial<IMentor>): Promise<IMentor | null> {
    try {
      return Mentor.create(data);
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findByUniqueCode(code: string): Promise<IMentor | null> {
    try {
      return Mentor.findOne({ uniqueCode: code });
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateOTP(
    email: string,
    code: string,
    expiresAt: Date
  ): Promise<IMentor | null> {
    try {
      return Mentor.findOneAndUpdate(
        { email },
        { otp: { code, expiresAt } },
        { new: true }
      );
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async verifyOTP(email: string, code: string): Promise<boolean | null> {
    try {
      const mentor = await Mentor.findOne({ email });
      if (!mentor || !mentor.otp || mentor.otp.code !== code) return false;
      if (new Date() > mentor.otp.expiresAt) return false;
      mentor.isVerified = true;
      mentor.otp = undefined;
      await mentor.save();
      return true;
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async findAll(
    query: Partial<Record<keyof IMentor, any>> = {},
    options?: { page?: number; limit?: number }
  ): Promise<{ results: IMentor[]; total: number }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 0;
      const skip = (page - 1) * limit;

      const results = await Mentor.find(query, "-password -otp -googleId")
        .skip(skip)
        .limit(limit);

      const total = await Mentor.countDocuments(query);

      return { results, total };
    } catch (error: unknown) {
      console.log("error", error);
      return { results: [], total: 0 };
    }
  }

  async updateMentorDocument(
    email: string,
    docUrl: string,
    docMessage: string
  ): Promise<IMentor | null> {
    console.log("repo this is update doc");
    try {
      return await Mentor.findOneAndUpdate(
        { email },
        {
          $set: {
            "document.documentUrl": docUrl,
            "document.textMessage": docMessage,
            "document.verificationStatus": "pending",
            "document.rejectionReason": "",
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateForgotPasswordOTP(
    email: string,
    code: string,
    expiresAt: Date,
    newPassword: string
  ): Promise<IMentor | null> {
    try {
      return Mentor.findOneAndUpdate(
        { email },
        { forgotPasswordOtp: { code, expiresAt, newPassword } },
        { new: true }
      );
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async verifyForgotPasswordOTP(
    email: string,
    code: string
  ): Promise<boolean | null> {
    try {
      const mentor = await Mentor.findOne({ email });
      if (
        !mentor ||
        !mentor.forgotPasswordOtp ||
        mentor.forgotPasswordOtp.code !== code
      ) {
        return false;
      }

      const now = new Date();
      if (now > mentor.forgotPasswordOtp.expiresAt) {
        return false;
      }

      mentor.password = mentor.forgotPasswordOtp.newPassword;
      mentor.forgotPasswordOtp = undefined;
      await mentor.save();
      return true;
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updatePassword(
    id: string,
    newPassword: string
  ): Promise<IMentor | null> {
    try {
      return Mentor.findByIdAndUpdate(id, { newPassword }, { new: true });
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async updateMentor(id: string, data: any): Promise<IMentor | null> {
    return Mentor.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async getDashboardData(mentorId: string, months = 6): Promise<any> {
    try {
      const totalStudents = await subscriptionModal.countDocuments({
        mentorId,
        status: "ACTIVE",
      });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const sessionsToday = await sessionsModel
        .find({
          mentorId,
          startTime: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["upcoming", "accepted", "pending", "completed"] },
        })
        .sort({ startTime: 1 })
        .lean();

      const totalSessions = await sessionsModel.countDocuments({ mentorId });
      const completedSessions = await sessionsModel.countDocuments({
        mentorId,
        status: "completed",
      });
      const avgProgress =
        totalSessions === 0
          ? 0
          : Math.round((completedSessions / totalSessions) * 100);

      const feedbackAgg = await sessionsModel.aggregate([
        {
          $match: {
            mentorId: new mongoose.Types.ObjectId(mentorId),
            "feedback.0": { $exists: true },
          },
        },
        { $unwind: "$feedback" },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$feedback.rating" },
          },
        },
      ]);

      const avgFeedbackValue =
        feedbackAgg.length > 0 ? feedbackAgg[0].avgRating : null;
      const avgFeedback =
        avgFeedbackValue === null
          ? "No feedback"
          : avgFeedbackValue >= 4.5
          ? "Excellent"
          : avgFeedbackValue >= 3.5
          ? "Good"
          : "Needs Improvement";

      const recentSessions = await sessionsModel
        .find({ mentorId })
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean();

      const recentActivities = recentSessions
        .flatMap((s) => {
          const activities: any[] = [];
          if (s.status === "completed") {
            activities.push({
              type: "Session Completed",
              feedback: s.feedback?.length
                ? s.feedback.map((f: any) => f.comment).join(" | ")
                : "No feedback",
              time: s.updatedAt,
            });
          }
          if (s.feedback?.length) {
            s.feedback.forEach((f: any) => {
              activities.push({
                type: "Feedback Received",
                feedback: f.comment,
                rating: f.rating,
                time: s.updatedAt,
              });
            });
          }
          return activities;
        })
        .slice(0, 6);

      const now = new Date();
      now.setDate(1);
      now.setHours(0, 0, 0, 0);

      const monthsArr: { label: string; year: number; month: number }[] = [];
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsArr.push({
          label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth() + 1, // 1-based month
        });
      }

      const rangeStart = new Date(
        monthsArr[0].year,
        monthsArr[0].month - 1,
        1,
        0,
        0,
        0,
        0
      );
      const rangeEnd = new Date(
        monthsArr[monthsArr.length - 1].year,
        monthsArr[monthsArr.length - 1].month,
        0,
        23,
        59,
        59,
        999
      );

      const sessionsRaw = await sessionsModel
        .find({
          mentorId,
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        })
        .lean();

      const subscriptionsRaw = await subscriptionModal
        .find({
          mentorId,
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
        })
        .lean();

      const paymentsRaw = await subscriptionModal
        .find({
          mentorId,
          createdAt: { $gte: rangeStart, $lte: rangeEnd },
          status: "ACTIVE",
        })
        .lean();

      const bucketKey = (d: Date) => {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        return `${y}-${String(m).padStart(2, "0")}`;
      };

      const sessionsMap: Record<string, number> = {};
      sessionsRaw.forEach((s: any) => {
        const key = bucketKey(new Date(s.createdAt));
        sessionsMap[key] = (sessionsMap[key] || 0) + 1;
      });

      const subsMap: Record<string, number> = {};
      subscriptionsRaw.forEach((s: any) => {
        const key = bucketKey(new Date(s.createdAt));
        subsMap[key] = (subsMap[key] || 0) + 1;
      });

      const paymentsMap: Record<string, number> = {};
      paymentsRaw.forEach((p: any) => {
        const key = bucketKey(new Date(p.createdAt));
        const amt = Number(p.amount || 0);
        paymentsMap[key] = (paymentsMap[key] || 0) + amt;
      });

      const chartData = monthsArr.map((m) => {
        const key = `${m.year}-${String(m.month).padStart(2, "0")}`;
        return {
          label: m.label,
          year: m.year,
          month: m.month,
          sessionsCount: sessionsMap[key] || 0,
          subscriptionsCount: subsMap[key] || 0,
          paymentsTotal: paymentsMap[key] || 0,
        };
      });

      return {
        totalStudents,
        todaysSessionsCount: sessionsToday.length,
        avgProgress,
        avgFeedback,
        avgFeedbackValue:
          avgFeedbackValue !== null
            ? Math.round(avgFeedbackValue * 10) / 10
            : null,
        sessionsToday,
        recentActivities,
        chartData,
      };
    } catch (error: unknown) {
      console.log("error in getDashboardData", error);
      return null;
    }
  }
}
export default MentorRepository;
