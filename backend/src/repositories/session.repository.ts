import SessionModel, { ISession } from "../models/sessions.model";
import { ISessionRepository } from "./interfaces/ISessionsRepository";
import { injectable } from "inversify";

@injectable()
export class SessionRepository implements ISessionRepository {
  async createSession(data: Partial<ISession>): Promise<ISession | null> {
    try {
      return await SessionModel.create(data);
    } catch (error) {
      console.log('error',error);
      return null;
    }
  }

  async getAllSessions(): Promise<ISession[] | null> {
    try {
      return await SessionModel.find()
      .populate("participants")
      .populate("createdBy");
    } catch (error) {
      console.log("error",error);
      return null;
    }
  }

  async getSessionById(id: string): Promise<ISession | null> {
    try {
      return await SessionModel.findById(id)
      .populate("participants")
      .populate("createdBy");
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
}
