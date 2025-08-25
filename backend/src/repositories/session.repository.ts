import mongoose from "mongoose";
import SessionModel, { ISession } from "../models/sessions.model";
import { ISessionRepository } from "./interfaces/ISessionsRepository";
import { injectable } from "inversify";

@injectable()
export class SessionRepository implements ISessionRepository {
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
        $or: [
          { createdBy: objectId },
          { "participants.user": objectId },
        ],
      })
        .populate({
          path: "participants.user",
          select: "name email profilePicture",
        })
        .populate({
          path: "createdBy",
          select: "name email profilePicture",
        });

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
        .populate("createdBy");
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
            ...(cancelReason && { "participants.$.cancelReason": cancelReason }),
          },
        },
        { new: true }
      );
    } catch (error) {
      console.log("error", error);
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
            flags: {
              flaggedBy,
              reason,
              ...(againstUser && { againstUser }),
            },
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
}
