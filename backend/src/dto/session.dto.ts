import { Types } from "mongoose";

export interface CreateSessionDTO {
  status: 'upcoming' | 'completed' | 'cancelled' | 'flagged' | 'accepted' | 'pending';
  type: 'public' | 'private' | 'peer-to-peer';
  topic: string;
  description: string;
  mentorId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  createdBy: Types.ObjectId;
  participants?: Types.ObjectId[];
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
  participants?: Types.ObjectId[];
  durationMinutes?: number;
  recordingLink?: string;
  sessionFee?: number;
}