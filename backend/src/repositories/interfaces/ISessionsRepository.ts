import { ISession } from "../../models/sessions.model";

export interface ISessionRepository {
  createSession(data: Partial<ISession>): Promise<ISession | null>;
  getAllSessions(userId: string): Promise<ISession[] | null>;
  getSessionById(id: string): Promise<ISession | null>;
  updateSession(id: string, data: Partial<ISession>): Promise<ISession | null>;
  getPublicSessions(): Promise<ISession[] | null>;

  updateParticipantStatus(
    sessionId: string,
    userId: string,
    status: "accepted" | "rejected" | "cancelled",
    reason?: string
  ): Promise<ISession | null>;

  addFlag(
    sessionId: string,
    fromUser: string,
    reason: string,
    toUser?: string
  ): Promise<ISession | null>;

  addFeedback(
    sessionId: string,
    feedback: { from: string; to: string; comment: string; rating?: number }
  ): Promise<ISession | null>;

  findSessions(query: any): Promise<ISession[] | null>;

  addParticipant(sessionId: string, userId: string): Promise<ISession | null>;

  findSessions(query: any): Promise<ISession[] | null>;

  findWithFilters(query: any, skip: number, limit: number):Promise<any>;

  countSessions(query: any):Promise<any>
}
