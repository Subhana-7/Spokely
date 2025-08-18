import mongoose from "mongoose";
import SessionModel, { ISession } from "../models/sessions.model";
import { ISessionRepository } from "./interfaces/ISessionsRepository";
import { injectable } from "inversify";

@injectable()
export class SessionRepository implements ISessionRepository {
  async createSession(data: Partial<ISession>): Promise<ISession | null> {
    try {
      console.log(data)
      return await SessionModel.create(data);
    } catch (error) {
      console.log('error',error);
      return null;
    }
  }


async getAllSessions(id: string): Promise<ISession[] | null> {
  try {
    const objectId = new mongoose.Types.ObjectId(id);

    console.log("Searching for user id:", id, "as ObjectId:", objectId);

    // Just to verify DB values for debugging
    const debugDocs = await SessionModel.find().select("createdBy participants");
    console.log("Sample session participants from DB:", debugDocs.map(d => d.participants));

    const res = await SessionModel.find({
      $or: [
        { createdBy: objectId },
        { participants: objectId },          // direct match for arrays
        { participants: { $in: [objectId] } } // safer match
      ]
    })
      .populate({
        path: "participants",
        select: "name email profilePicture"
      })
      .populate({
        path: "createdBy",
        select: "name email profilePicture"
      });

    console.log("Found sessions:", res.length);
    return res;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return null;
  }
}



  async getSessionById(id: string): Promise<ISession | null> {
    try {
      let res = await SessionModel.findById(id)
      .populate("participants")
      .populate("createdBy");
      console.log(res)
      return res;
    } catch (error) {
      console.log("error",error);
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
      console.log("error",error);
      return null;
    }
  }
  async getPublicSessions():Promise<ISession[] | null> {
    try {
      return await SessionModel.find({type:"public"});
    } catch (error) {
      console.log("error",error);
      return null;
    }
  }
}
