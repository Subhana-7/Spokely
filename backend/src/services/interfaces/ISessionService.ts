import { ISession } from "../../models/sessions.model";

export interface ISessionService {
  createSession(body: any, userId: string): Promise<ISession | null>;
  getSessions(userId: string,filters:any): Promise<ISession[] | null>;
  getSessionById(sessionId: string): Promise<ISession | null>;
  updateSession(sessionId: string, body: any): Promise<ISession | null>;
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

  addFeedback(
    sessionId: string,
    from: string,
    to: string,
    comment: string,
    rating?: number
  ): Promise<ISession | null>;

  getAllSessionsAdmin(filters?: {
    status?: string;
    type?: string;
    mentorId?: string;
  }): Promise<ISession[] | null>;
  getAgoraToken(sessionId: string, userId: string): Promise<any>;

  publicSessionsWithFilters(filters?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}):Promise<any>;
}
