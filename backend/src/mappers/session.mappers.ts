import { CreateSessionDTO,UpdateSessionDTO } from "../dto/session.dto";
import { ISession } from "../models/sessions.model";
import mongoose,{Types} from "mongoose";

export const mapToCreateSessionDTO = (body: any, userId: string): CreateSessionDTO => {
  return {
    type: body.type,
    topic: body.topic,
    description: body.description,
    mentorId: body.mentorId,
    startTime: new Date(body.startTime),
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    createdBy: new Types.ObjectId(userId),
    participants: body.participants,
    sessionFee: body.sessionFee,
  };
};

export const mapToUpdateSessionDTO = (body: any): UpdateSessionDTO => {
  return {
    type: body.type,
    topic: body.topic,
    description: body.description,
    mentorId: body.mentorId,
    startTime: body.startTime ? new Date(body.startTime) : undefined,
    endTime: body.endTime ? new Date(body.endTime) : undefined,
    status: body.status,
    participants: body.participants,
    durationMinutes: body.durationMinutes,
    recordingLink: body.recordingLink,
    sessionFee: body.sessionFee,
  };
};
