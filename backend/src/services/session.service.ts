import { SessionRepository } from "../repositories/session.repository";
import { ISession } from "../models/sessions.model";

export const SessionService = {
  createSession: async (sessionData: Partial<ISession>) => {
    return await SessionRepository.createSession(sessionData);
  },

  getSessions: async () => {
    return await SessionRepository.getAllSessions();
  },

  getSessionById: async (id: string) => {
    return await SessionRepository.getSessionById(id);
  },

  updateSession: async (id: string, updates: Partial<ISession>) => {
    return await SessionRepository.updateSession(id, updates);
  }
};
