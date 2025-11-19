import mongoose, { Types } from "mongoose";
import SessionModel, { ISession } from "../models/sessions.model";
import { ISessionRepository } from "./interfaces/ISessionsRepository";
import { injectable } from "inversify";
import { BaseRepository } from "./base.repository";

@injectable()
export class SessionRepository
  extends BaseRepository<ISession>
  implements ISessionRepository
{
  constructor() {
    super(SessionModel);
  }

  async createSession(data: Partial<ISession>): Promise<ISession | null> {
    try {
      return await SessionModel.create(data);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAllSessions(id: string): Promise<ISession[] | null> {
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const res = await SessionModel.find({
        $or: [{ createdBy: objectId }, { "participants.user": objectId }],
      })
        .populate({
          path: "participants.user",
          select: "name email profilePicture",
        })
        .populate({ path: "createdBy", select: "name email profilePicture" });

      return res;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return null;
    }
  }

  async getSessionById(id: string): Promise<ISession | null> {
    try {
      return await SessionModel.findById(id)
        .populate("participants.user")
        .populate({
          path: "createdBy",
          select: "name email profilePicture role",
        });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateSession(
    id: string,
    data: Partial<ISession>
  ): Promise<ISession | null> {
    try {
      return await SessionModel.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async updateParticipantStatus(
    sessionId: string,
    userId: string,
    status: "accepted" | "rejected" | "cancelled",
    cancelReason?: string
  ): Promise<ISession | null> {
    try {
      return await SessionModel.findOneAndUpdate(
        { _id: sessionId, "participants.user": userId },
        {
          $set: {
            "participants.$.status": status,
            ...(cancelReason && {
              "participants.$.cancelReason": cancelReason,
            }),
          },
        },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async addParticipant(
    sessionId: string,
    userId: string
  ): Promise<ISession | null> {
    try {
      const session = await SessionModel.findById(sessionId);
      if (!session) return null;

      let maxParticipants = 2;
      if (session.type === "peer-to-peer") maxParticipants = 10;
      if (session.type === "private" || session.type === "public")
        maxParticipants = 25;

      const alreadyJoined = session.participants.some(
        (p) => p.user.toString() === userId.toString()
      );
      if (alreadyJoined) return session;

      if (session.participants.length >= maxParticipants) {
        throw new Error("Session participant limit reached");
      }

      session.participants.push({
        user: new Types.ObjectId(userId),
        status: "accepted",
      });
      return await session.save();
    } catch (error) {
      console.log("error adding participant:", error);
      return null;
    }
  }

  async addFlag(
    sessionId: string,
    flaggedBy: string,
    reason: string,
    againstUser?: string
  ): Promise<ISession | null> {
    try {
      return await SessionModel.findByIdAndUpdate(
        sessionId,
        {
          $push: {
            flags: { flaggedBy, reason, ...(againstUser && { againstUser }) },
          },
          $set: { status: "flagged" },
        },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getPublicSessions(): Promise<ISession[] | null> {
    try {
      return await SessionModel.find({ type: "public" });
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async addFeedback(
    sessionId: string,
    feedback: { from: string; to: string; comment: string; rating?: number }
  ): Promise<ISession | null> {
    try {
      return await SessionModel.findByIdAndUpdate(
        sessionId,
        { $push: { feedback } },
        { new: true }
      )
        .populate("participants.user")
        .populate("createdBy")
        .populate("feedback.from", "name profilePicture")
        .populate("feedback.to", "name profilePicture");
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findSessions(query: any): Promise<ISession[] | null> {
    try {
      return await SessionModel.find(query);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async publicSessionAvailability(
    userId: string,
    mentorId: string,
    date: Date
  ): Promise<ISession[] | null> {
    try {
      return await SessionModel.find({
        type: "public",
        mentorId: mentorId,
        "participants.user": userId,
        startTime: date,
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findWithFilters(query: any, skip: number, limit: number) {
    try {
      return await SessionModel.find(query)
        .populate({
          path: "participants.user",
          select: "name email profilePicture",
        })
        .populate({
          path: "createdBy",
          select: "name email profilePicture",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (error) {
      console.error("Error in findWithFilters:", error);
      return [];
    }
  }

  async countSessions(query: any) {
    try {
      return await SessionModel.countDocuments(query);
    } catch (error) {
      console.error("Error in countSessions:", error);
      return 0;
    }
  }

  async findSessionsPaginated(
    query: any = {},
    options: { page: number; limit: number }
  ): Promise<{ sessions: any[]; total: number }> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const sessions = await SessionModel.find(query)
      .populate("createdBy", "name email role")
      .populate("participants.user", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SessionModel.countDocuments(query);

    return { sessions, total };
  }


}
