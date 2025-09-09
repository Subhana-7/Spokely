import { Types } from "mongoose";

export interface ParticipantDTO {
  user: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  cancelReason?: string;
}

export interface CreateSessionDTO {
  status: 'upcoming' | 'completed' | 'cancelled' | 'flagged' | 'accepted' | 'pending';
  type: 'public' | 'private' | 'peer-to-peer';
  topic: string;
  description: string;
  mentorId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  createdBy: Types.ObjectId;
  createdByModel:string;
  participants?: ParticipantDTO[];
  sessionFee?: number;
}

export interface UpdateSessionDTO {
  type?: 'public' | 'private' | 'peer-to-peer';
  topic?: string;
  description?: string;
  mentorId?: Types.ObjectId;
  startTime?: Date;
  endTime?: Date;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'flagged' | 'accepted' | 'pending';
  participants?: ParticipantDTO[];
  durationMinutes?: number;
  recordingLink?: string;
  sessionFee?: number;
}

export interface FlagSessionDTO {
  sessionId: string;
  userId: string;
  reason: string;
  flaggedUserId?: string;
}
