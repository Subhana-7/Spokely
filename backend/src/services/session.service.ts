import { ISession } from "../models/sessions.model";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ISessionRepository } from "../repositories/interfaces/ISessionsRepository";
import { CreateSessionDTO, UpdateSessionDTO } from "../dto/session.dto";
import {
  mapToCreateSessionDTO,
  mapToUpdateSessionDTO,
} from "../mappers/session.mappers";
import { generateAgoraToken } from "../config/agora";
import { MESSAGES } from "../utilis/constants";

@injectable()
export class SessionService {
  constructor(
    @inject(TYPES.ISessionRepository)
    private readonly _sessionRepository: ISessionRepository
  ) {}

  async createSession(body: any, userId: string): Promise<ISession | null> {
    const dto = mapToCreateSessionDTO(body, userId);

    let maxParticipants = 2;
    if (dto.type === "peer-to-peer") maxParticipants = 10;
    if (dto.type === "private" || dto.type === "public") maxParticipants = 25;

    if (dto.participants && dto.participants.length > maxParticipants) {
      throw new Error(MESSAGES.SESSION.PARTICIPANT_LIMIT_EXCEEDED);
    }

    if (dto.type === "private" || dto.mentorId) dto.status = "pending";
    else dto.status = "upcoming";

    return await this._sessionRepository.createSession(dto);
  }

  async getSessions(userId: string): Promise<ISession[] | null> {
    let sessions = await this._sessionRepository.getAllSessions(userId);
    if (!sessions) return [];

    const now = new Date();
    for (const session of sessions) {
      const start = new Date(session.startTime);
      const end = new Date(
        session.endTime ||
          start.getTime() + (session.durationMinutes || 60) * 60000
      );

      if (session.status === "pending" && now >= start) {
        session.status = "cancelled";
        await this._sessionRepository.updateSession(session._id as string, {
          status: "cancelled",
        });
      } else if (
        (session.status === "upcoming" || session.status === "accepted") &&
        now > end
      ) {
        session.status = "completed";
        await this._sessionRepository.updateSession(session._id as string, {
          status: "completed",
        });
      }
    }
    return sessions;
  }

  async getSessionById(sessionId: string): Promise<ISession | null> {
    return await this._sessionRepository.getSessionById(sessionId);
  }

  async updateSession(sessionId: string, body: any): Promise<ISession | null> {
    const dto: UpdateSessionDTO = mapToUpdateSessionDTO(body);
    return await this._sessionRepository.updateSession(sessionId, dto);
  }

  async respondToInvite(
    sessionId: string,
    userId: string,
    status: "accepted" | "rejected"
  ): Promise<ISession | null> {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error(MESSAGES.SESSION.NOT_FOUND);

    const now = new Date();
    const cutoff = new Date(session.startTime);
    cutoff.setMinutes(cutoff.getMinutes() - 15);
    if (now > cutoff) throw new Error(MESSAGES.SESSION.INVITE_TOO_LATE);

    return await this._sessionRepository.updateParticipantStatus(
      sessionId,
      userId,
      status
    );
  }

  async cancelParticipation(
    sessionId: string,
    userId: string,
    reason: string
  ): Promise<ISession | null> {
    return await this._sessionRepository.updateParticipantStatus(
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
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) return null;

    return await this._sessionRepository.updateSession(sessionId, {
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
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error(MESSAGES.SESSION.NOT_FOUND);

    if (session.status !== "completed")
      throw new Error(MESSAGES.SESSION.FLAG_NOT_ALLOWED);

    return await this._sessionRepository.addFlag(
      sessionId,
      userId,
      reason,
      againstUser
    );
  }

  async publicSessions(): Promise<ISession[] | null> {
    return await this._sessionRepository.getPublicSessions();
  }

  async addFeedback(
    sessionId: string,
    from: string,
    to: string,
    comment: string,
    rating?: number
  ): Promise<ISession | null> {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== "completed")
      throw new Error(MESSAGES.SESSION.FEEDBACK_NOT_ALLOWED);

    const alreadyGiven = session.feedback?.some(
      (f: any) => f.from.toString() === from && f.to.toString() === to
    );
    if (alreadyGiven) throw new Error(MESSAGES.SESSION.FEEDBACK_ALREADY_GIVEN);

    return await this._sessionRepository.addFeedback(sessionId, {
      from,
      to,
      comment,
      rating,
    });
  }

  async getAllSessionsAdmin(filters?: {
    status?: string;
    type?: string;
    mentorId?: string;
  }): Promise<ISession[] | null> {
    const query: any = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.type) query.type = filters.type;
    if (filters?.mentorId) query.mentorId = filters.mentorId;
    return await this._sessionRepository.findSessions(query);
  }

  async getAgoraToken(sessionId: string, userId: string) {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) return null;

    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(
      session.endTime ||
        start.getTime() + (session.durationMinutes || 60) * 60000
    );

    if (!(now >= start && now <= end)) return null;

    const channelName = `session_${sessionId}`;
    const token = generateAgoraToken(channelName, userId.toString());
    return { token, channelName, appId: process.env.AGORA_APP_ID, uid: userId };
  }
}
