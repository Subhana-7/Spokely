import SessionModel, { ISession } from "../models/sessions.model";

export const SessionRepository = {
  createSession: async (data: Partial<ISession>) => {
    return await SessionModel.create(data);
  },

  getAllSessions: async () => {
    return await SessionModel.find().populate('participants').populate('createdBy');
  },

  getSessionById: async (id: string) => {
    return await SessionModel.findById(id).populate('participants').populate('createdBy');
  },

  updateSession: async (id: string, data: Partial<ISession>) => {
    return await SessionModel.findByIdAndUpdate(id, data, { new: true });
  }
};
