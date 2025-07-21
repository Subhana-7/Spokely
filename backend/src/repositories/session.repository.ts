import SessionModel, { ISession } from "../models/sessions.model";

export class SessionRepository {
  async createSession(data: Partial<ISession>) {
    return await SessionModel.create(data);
  }

  async getAllSessions() {
    return await SessionModel.find()
      .populate("participants")
      .populate("createdBy");
  }

  async getSessionById(id: string) {
    return await SessionModel.findById(id)
      .populate("participants")
      .populate("createdBy");
  }

  async updateSession(id: string, data: Partial<ISession>) {
    return await SessionModel.findByIdAndUpdate(id, data, { new: true });
  }
}
