import { ISession } from "../../models/sessions.model";

export interface ISessionService {
  createSession(sessionData: Partial<ISession>): Promise<ISession | null>;
  getSessions(userId: string): Promise<ISession[] | null>;
  getSessionById(id: string): Promise<ISession | null>;
  updateSession(
    id: string,
    updates: Partial<ISession>
  ): Promise<ISession | null>;
  publicSessions(): Promise<ISession[] | null>;

  
  respondToInvite(
    sessionId: string,
    userId: string,
    status: "accepted" | "rejected"
  ): Promise<ISession | null>;
  cancelParticipation(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<ISession | null>;
  cancelSession(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<ISession | null>;
  flagSession(
    sessionId: string,
    userId: string,
    reason: string,
    flaggedUserId?: string
  ): Promise<ISession | null>;
}
