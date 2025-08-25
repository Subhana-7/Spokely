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
}
