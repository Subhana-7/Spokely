import { ISession } from "../models/sessions.model";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { CreateSessionDTO, UpdateSessionDTO } from "../dto/session.dto";
import { mapToCreateSessionDTO, mapToUpdateSessionDTO } from "../mappers/session.mappers";
import { generateAgoraToken } from "../config/agora";

@injectable()
export class SessionService {
  constructor(
    @inject(TYPES.ISessionRepository) private readonly repo: ISessionRepository
  ) {}

  async createSession(body: any, userId: string): Promise<ISession | null> {
    const dto = mapToCreateSessionDTO(body, userId);
    if (dto.type === "private" || dto.mentorId) dto.status = "pending";
    else dto.status = "upcoming";
    return await this.repo.createSession(dto);
  }

  async getSessions(userId: string): Promise<ISession[] | null> {
    let sessions = await this.repo.getAllSessions(userId);
    if (!sessions) return null;

    const now = new Date();
    for (const session of sessions) {
      const start = new Date(session.startTime);
      const end = new Date(
        session.endTime || start.getTime() + (session.durationMinutes || 60) * 60000
      );

      if (session.status === "pending" && now >= start) {
        session.status = "cancelled";
        await this.repo.updateSession(session._id as string, { status: "cancelled" });
      } else if (
        (session.status === "upcoming" || session.status === "accepted") &&
        now > end
      ) {
        session.status = "completed";
        await this.repo.updateSession(session._id as string, { status: "completed" });
      }
    }
    return sessions;
  }

  async getSessionById(id: string): Promise<ISession | null> {
    return await this.repo.getSessionById(id);
  }

  async updateSession(id: string, body: any): Promise<ISession | null> {
    const dto: UpdateSessionDTO = mapToUpdateSessionDTO(body);
    return await this.repo.updateSession(id, dto);
  }

  async respondToInvite(sessionId: string, userId: string, status: "accepted" | "rejected"): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    const now = new Date();
    const cutoff = new Date(session.startTime);
    cutoff.setMinutes(cutoff.getMinutes() - 15);
    if (now > cutoff) throw new Error("Too late to accept/reject this session");

    return await this.repo.updateParticipantStatus(sessionId, userId, status);
  }

  async cancelParticipation(sessionId: string, userId: string, reason: string): Promise<ISession | null> {
    return await this.repo.updateParticipantStatus(sessionId, userId, "cancelled", reason);
  }

  async cancelSession(sessionId: string, userId: string, reason: string): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    return await this.repo.updateSession(sessionId, { status: "cancelled", cancelReason: reason });
  }

  async flagSession(sessionId: string, userId: string, reason: string, againstUser?: string): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== "completed") throw new Error("Can only flag completed sessions");

    return await this.repo.addFlag(sessionId, userId, reason, againstUser);
  }

  async publicSessions(): Promise<ISession[] | null> {
    return await this.repo.getPublicSessions();
  }

  async addFeedback(sessionId: string, from: string, to: string, comment: string, rating?: number): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== "completed") throw new Error("Can only give feedback on completed sessions");

    const alreadyGiven = session.feedback?.some(
      (f: any) => f.from.toString() === from && f.to.toString() === to
    );
    if (alreadyGiven) throw new Error("Feedback already given to this user");

    return await this.repo.addFeedback(sessionId, { from, to, comment, rating });
  }

  async getAllSessionsAdmin(filters?: { status?: string; type?: string; mentorId?: string }): Promise<ISession[] | null> {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.type) query.type = filters.type;
    if (filters?.mentorId) query.mentorId = filters.mentorId;
    return await this.repo.findSessions(query);
  }

  async getAgoraToken(sessionId: string, userId: string) {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime || start.getTime() + (session.durationMinutes || 60) * 60000);

    if (!(now >= start && now <= end)) return null;

    const channelName = `session_${sessionId}`;
    const token = generateAgoraToken(channelName, userId.toString());
    return { token, channelName, appId: process.env.AGORA_APP_ID, uid: userId };
  }
}
