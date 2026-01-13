import {
  CreateSessionDTO,
  UpdateSessionDTO,
  ParticipantDTO,
  FlagSessionDTO,
} from "../dto/session.dto";
import { Types } from "mongoose";

export const mapToCreateSessionDTO = (
  body: any,
  userId?: string
): CreateSessionDTO => {
  const participants: ParticipantDTO[] = body.participants?.map((p: any) => ({
    user: new Types.ObjectId(p.user || p),
    status: p.status ?? "pending",
    cancelReason: p.cancelReason,
  }));

  return {
    type: body.type,
    topic: body.topic,
    description: body.description,
    mentorId: body.mentorId ? new Types.ObjectId(body.mentorId) : undefined,
    startTime: new Date(body.startTime),
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    createdBy: new Types.ObjectId(userId),
    createdByModel: body.role,
    participants,
    sessionFee: body.sessionFee,
    status: body.status || "pending",
  };
};

export const mapToUpdateSessionDTO = (body: any): UpdateSessionDTO => {
  const participants: ParticipantDTO[] = body.participants?.map((p: any) => ({
    user: new Types.ObjectId(p.user || p),
    status: p.status ?? "pending",
    cancelReason: p.cancelReason,
  }));

  return {
    type: body.type,
    topic: body.topic,
    description: body.description,
    mentorId: body.mentorId ? new Types.ObjectId(body.mentorId) : undefined,
    startTime: body.startTime ? new Date(body.startTime) : undefined,
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    status: body.status,
    participants,
    durationMinutes: body.durationMinutes,
    recordingLink: body.recordingLink,
    sessionFee: body.sessionFee,
  };
};

export const mapToFlagSessionDTO = (
  body: any,
  userId: string
): FlagSessionDTO => {
  return {
    sessionId: body.sessionId,
    userId,
    reason: body.reason,
    flaggedUserId: body.flaggedUserId,
  };
};
