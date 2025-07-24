import { ISession } from "../../models/sessions.model";

export interface ISessionService {
  createSession(sessionData: Partial<ISession>): Promise<ISession | null>;
  getSessions(): Promise<ISession[] | null>;
  getSessionById(id: string): Promise<ISession | null>;
  updateSession(id: string, updates: Partial<ISession>): Promise<ISession | null>;
}