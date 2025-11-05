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
import { IWalletService } from "./interfaces/IWalletService";
import { INotificationService } from "./interfaces/INotificationService";

@injectable()
export class SessionService {
  constructor(
    @inject(TYPES.ISessionRepository)
    private readonly _sessionRepository: ISessionRepository,
    @inject(TYPES.IWalletService)
    private readonly _walletService: IWalletService,
    @inject(TYPES.INotificationService)
    private readonly _notificationService: INotificationService
  ) {}

  async createSession(body: any, userId: string): Promise<ISession | null> {
    console.log("create session");
    const dto = mapToCreateSessionDTO(body, userId);

    let maxParticipants = 2;
    if (dto.type === "peer-to-peer") maxParticipants = 10;
    if (dto.type === "private" || dto.type === "public") maxParticipants = 25;

    if (dto.participants && dto.participants.length > maxParticipants) {
      throw new Error(MESSAGES.SESSION.PARTICIPANT_LIMIT_EXCEEDED);
    }

    if (dto.type === "private" || dto.mentorId) dto.status = "pending";
    else dto.status = "upcoming";

    const session = await this._sessionRepository.createSession(dto);
    console.log("session", session);

    if (!session) {
      throw new Error(MESSAGES.SESSION.NOT_FOUND);
    }

    switch (session.type) {
      case "private":
        for (const participant of session.participants || []) {
          await this._notificationService.send({
            userId: participant.user.toString(),
            title: "New Private Session Invitation",
            message: `You've been invited to a private session: "${session.topic}" by your mentor.`,
            type: "info",
          });
        }
        break;

      case "peer-to-peer":
        for (const participant of session.participants || []) {
          await this._notificationService.send({
            userId: participant.user.toString(),
            title: "Peer-to-Peer Session Invite",
            message: `You’ve been invited to join a session: "${session.topic}".`,
            type: "info",
          });
        }
        break;

      case "public":
        // no notifications on create — users discover it
        break;
    }

    await this._notificationService.send({
      userId: session.createdBy.toString(),
      title: "Session Created Successfully",
      message: `Your session "${session.topic}" has been created.`,
      type: "success",
    });

    return session;
  }

  async getSessions(
  userId: string,
  filters?: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }
): Promise<{ sessions: ISession[]; total: number; page: number; totalPages: number }> {
  const { search = "", status = "all", type = "all", page = 1, limit = 10 } = filters || {};

  const query: any = {
    $or: [{ createdBy: userId }, { "participants.user": userId }],
  };

  if (status !== "all") query.status = status;
  if (type !== "all") query.type = type;
  if (search) query.topic = { $regex: search, $options: "i" };

  const skip = (page - 1) * limit;

  const [sessions, total] = await Promise.all([
    this._sessionRepository.findWithFilters(query, skip, limit),
    this._sessionRepository.countSessions(query),
  ]);

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

  return {
    sessions,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}


  async getSessionById(sessionId: string): Promise<ISession | null> {
    return await this._sessionRepository.getSessionById(sessionId);
  }

  async updateSession(sessionId: string, body: any): Promise<ISession | null> {
    console.log("update session", body);
    const dto: UpdateSessionDTO = mapToUpdateSessionDTO(body);
    console.log(dto);
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

    console.log(session);

    if (session.type === "public") {
      await this._walletService.credit(
        userId,
        session.sessionFee ?? 0,
        "Refund for cancelled public session",
        sessionId
      );
    }

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
