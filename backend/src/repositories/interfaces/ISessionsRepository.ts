import { ISession } from "../../models/sessions.model";

export interface ISessionRepository {
  createSession(data: Partial<ISession>): Promise<ISession | null>;
  getAllSessions(id:string): Promise<ISession[] | null>; // populated with participants and createdBy
  getSessionById(id: string): Promise<ISession | null>;
  updateSession(id: string, data: Partial<ISession>): Promise<ISession | null>;
  getPublicSessions():Promise<ISession[] |null>;
}
