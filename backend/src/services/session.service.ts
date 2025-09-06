import { ISession } from "../models/sessions.model";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { CreateSessionDTO, UpdateSessionDTO } from "../dto/session.dto";

@injectable()
export class SessionService {
  private readonly repo: ISessionRepository;

  constructor(@inject(TYPES.ISessionRepository) repo: ISessionRepository) {
    this.repo = repo;
  }

  async createSession(sessionData: CreateSessionDTO): Promise<ISession | null> {
    return await this.repo.createSession(sessionData);
  }

  async getSessions(userId: string): Promise<ISession[] | null> {
    return await this.repo.getAllSessions(userId);
  }

  async getSessionById(id: string): Promise<ISession | null> {
    return await this.repo.getSessionById(id);
  }

  async updateSession(
    id: string,
    updates: UpdateSessionDTO
  ): Promise<ISession | null> {
    return await this.repo.updateSession(id, updates);
  }

  async respondToInvite(
    sessionId: string,
    userId: string,
    status: "accepted" | "rejected"
  ): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    // 15 min cutoff
    const now = new Date();
    const cutoff = new Date(session.startTime);
    cutoff.setMinutes(cutoff.getMinutes() - 15);
    if (now > cutoff) {
      throw new Error("Too late to accept/reject this session");
    }

    return await this.repo.updateParticipantStatus(sessionId, userId, status);
  }

  async cancelParticipation(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<ISession | null> {
    return await this.repo.updateParticipantStatus(
      sessionId,
      userId,
      "cancelled",
      reason
    );
  }

  async cancelSession(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    // if (session.createdBy.toString() !== userId) {
    //   throw new Error("Only session creator can cancel this session");
    // }

    return await this.repo.updateSession(sessionId, {
      status: "cancelled",
      cancelReason: reason,
    });
  }

  async flagSession(
    sessionId: string,
    userId: string,
    reason: string,
    againstUser?: string
  ): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== "completed") {
      throw new Error("Can only flag completed sessions");
    }

    return await this.repo.addFlag(sessionId, userId, reason, againstUser);
  }

  async publicSessions(): Promise<ISession[] | null> {
    return await this.repo.getPublicSessions();
  }

  async addFeedback(
    sessionId: string,
    from: string,
    to: string,
    comment: string,
    rating?: number
  ): Promise<ISession | null> {
    const session = await this.repo.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== "completed") {
      throw new Error("Can only give feedback on completed sessions");
    }

    // Prevent duplicate feedback
    const alreadyGiven = session.feedback?.some(
      (f: any) => f.from.toString() === from && f.to.toString() === to
    );
    if (alreadyGiven) throw new Error("Feedback already given to this user");

    return await this.repo.addFeedback(sessionId, {
      from,
      to,
      comment,
      rating,
    });
  }

  async getAllSessionsAdmin(filters?: { status?: string, type?: string, mentorId?: string }): Promise<ISession[] | null> {
  try {
    console.log('he')
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.type) query.type = filters.type;
    if (filters?.mentorId) query.mentorId = filters.mentorId;

    return await this.repo.findSessions(query);
  } catch (err) {
    console.error(err);
    return null;
  }
}

}
