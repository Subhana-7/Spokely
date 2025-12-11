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
import {
  MESSAGES,
  SESSION_STATUS,
  SESSION_TYPE,
  SESSION_STRINGS,
  NOTIFICATION_TYPE,
} from "../utilis/constants";
import { IWalletService } from "./interfaces/IWalletService";
import { INotificationService } from "./interfaces/INotificationService";
import { Types } from "mongoose";

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
    console.log(SESSION_STRINGS.LOGS.CREATE_SESSION);

    const dto = mapToCreateSessionDTO(body, userId);

    if (!dto.mentorId) {
      dto.mentorId = new Types.ObjectId(userId);
    }

    console.log(SESSION_STRINGS.LOGS.MENTOR_ID, dto.mentorId);

    let maxParticipants: number = SESSION_STRINGS.DEFAULTS.MAX_PARTICIPANTS;

    if (dto.type === SESSION_TYPE.PEER_TO_PEER)
      maxParticipants = SESSION_STRINGS.DEFAULTS.P2P_MAX;

    if (dto.type === SESSION_TYPE.PRIVATE)
      maxParticipants = SESSION_STRINGS.DEFAULTS.PRIVATE_MAX;

    if (dto.type === SESSION_TYPE.PUBLIC)
      maxParticipants = SESSION_STRINGS.DEFAULTS.PUBLIC_MAX;

    if (dto.participants && dto.participants.length > maxParticipants) {
      throw new Error(MESSAGES.SESSION.PARTICIPANT_LIMIT_EXCEEDED);
    }

    if (dto.type === SESSION_TYPE.PRIVATE || dto.mentorId)
      dto.status = SESSION_STATUS.PENDING;
    else dto.status = SESSION_STATUS.UPCOMING;

    const session = await this._sessionRepository.createSession(dto);
    console.log("session", session);

    if (!session) throw new Error(MESSAGES.SESSION.NOT_FOUND);

    switch (session.type) {
      case SESSION_TYPE.PRIVATE:
        for (const participant of session.participants || []) {
          await this._notificationService.send({
            userId: participant.user.toString(),
            title: SESSION_STRINGS.NOTIFICATIONS.TITLES.PRIVATE_INVITE,
            message: SESSION_STRINGS.NOTIFICATIONS.MESSAGES.PRIVATE_INVITE(
              session.topic
            ),
            type: NOTIFICATION_TYPE.INFO,
          });
        }
        break;

      case SESSION_TYPE.PEER_TO_PEER:
        for (const participant of session.participants || []) {
          await this._notificationService.send({
            userId: participant.user.toString(),
            title: SESSION_STRINGS.NOTIFICATIONS.TITLES.PEER_INVITE,
            message: SESSION_STRINGS.NOTIFICATIONS.MESSAGES.PEER_INVITE(
              session.topic
            ),
            type: NOTIFICATION_TYPE.INFO,
          });
        }
        break;

      case SESSION_TYPE.PUBLIC:
        break;
    }

    await this._notificationService.send({
      userId: session.createdBy.toString(),
      title: SESSION_STRINGS.NOTIFICATIONS.TITLES.SESSION_CREATED,
      message: SESSION_STRINGS.NOTIFICATIONS.MESSAGES.SESSION_CREATED(
        session.topic
      ),
      type: NOTIFICATION_TYPE.SUCCESS,
    });

    return session;
  }

  async getSessions(userId: string, filters?: any):Promise<unknown> {
    const {
      search = "",
      status = "all",
      type = "all",
      page = 1,
      limit = 10,
    } = filters || {};

    const query: any = {
      $or: [{ createdBy: userId }, { "participants.user": userId }],
    };

    if (status !== "all") query.status = status;
    if (type !== "all") query.type = type;
    if (search)
      query.topic = {
        $regex: search,
        $options: SESSION_STRINGS.DEFAULTS.REGEX_OPTIONS,
      };

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

      if (
        (session.status === SESSION_STATUS.UPCOMING ||
          session.status === SESSION_STATUS.PENDING ||
          session.status === SESSION_STATUS.ACCEPTED) &&
        now >= start &&
        now <= end
      ) {
        session.status = SESSION_STATUS.ONGOING;
        await this._sessionRepository.updateSession(session._id, {
          status: SESSION_STATUS.ONGOING,
        });
      } else if (
        (session.status === SESSION_STATUS.UPCOMING ||
          session.status === SESSION_STATUS.ACCEPTED ||
          session.status === SESSION_STATUS.ONGOING) &&
        now > end
      ) {
        session.status = SESSION_STATUS.COMPLETED;
        await this._sessionRepository.updateSession(session._id, {
          status: SESSION_STATUS.COMPLETED,
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
    return await this._sessionRepository.updateSession(sessionId, dto);
  }

  async respondToInvite(sessionId: string, userId: string, status: any) {
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

  async cancelParticipation(sessionId: string, userId: string, reason: string) {
    return await this._sessionRepository.updateParticipantStatus(
      sessionId,
      userId,
      SESSION_STATUS.CANCELLED,
      reason
    );
  }

  async cancelSession(sessionId: string, userId: string, reason: string) {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) return null;

    if (session.type === SESSION_TYPE.PUBLIC) {
      await this._walletService.credit(
        userId,
        session.sessionFee ?? 0,
        SESSION_STRINGS.WALLET.REFUND_PUBLIC_SESSION,
        sessionId
      );
    }

    return await this._sessionRepository.updateSession(sessionId, {
      status: SESSION_STATUS.CANCELLED,
      cancelReason: reason,
    });
  }

  async flagSession(
    sessionId: string,
    userId: string,
    reason: string,
    againstUser?: string
  ) {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) throw new Error(MESSAGES.SESSION.NOT_FOUND);

    if (session.status !== SESSION_STATUS.COMPLETED)
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
  ) {
    const session = await this._sessionRepository.getSessionById(sessionId);
    if (!session) return null;

    if (session.status !== SESSION_STATUS.COMPLETED)
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

  async getAllSessionsAdmin(filters?: any): Promise<ISession[] | null> {
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

    const channelName =
      SESSION_STRINGS.DEFAULTS.AGORA_CHANNEL_PREFIX + sessionId;

    const token = generateAgoraToken(channelName, userId.toString());

    const uid = userId.toString(); // use string UID
    const agoraUid = userId.toString();

    return {
      token,
      channelName,
      appId: process.env.AGORA_APP_ID,
      uid: agoraUid, // string uid
    };
  }

  async publicSessionsWithFilters(filters?: any) {
    const { search = "", status = "all", page = 1, limit = 10 } = filters || {};

    const query: any = { type: SESSION_TYPE.PUBLIC };

    if (status !== "all") query.status = status;
    if (search) {
      query.$or = [
        {
          topic: {
            $regex: search,
            $options: SESSION_STRINGS.DEFAULTS.REGEX_OPTIONS,
          },
        },
        {
          description: {
            $regex: search,
            $options: SESSION_STRINGS.DEFAULTS.REGEX_OPTIONS,
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this._sessionRepository.findWithFilters(query, skip, limit),
      this._sessionRepository.countSessions(query),
    ]);

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
