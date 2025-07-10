import { Schema, model, Types, Document } from "mongoose";

export interface IFeedback {
  from: Types.ObjectId;
  to: Types.ObjectId;
  comment: string;
  rating?: number; 
}

export interface ISession extends Document {
  type: 'public' | 'private' | 'peer-to-peer'; 
  topic: string; 
  description: string;
  mentorId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status: 'upcoming' | 'completed' | 'cancelled' | 'flagged';
  createdBy: Types.ObjectId;
  participants: Types.ObjectId[];
  durationMinutes?: number;
  recordingLink?: string;
  feedback?: IFeedback[];
  sessionFee?: number;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number }, 
  },
  { _id: false }
);

const sessionSchema = new Schema<ISession>(
  {
    type: { type: String, enum: ['public', 'private', 'peer-to-peer'], required: true },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "User" },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled', 'flagged'], default: 'upcoming' },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    durationMinutes: { type: Number },
    recordingLink: { type: String },
    feedback: [feedbackSchema],
    sessionFee: { type: Number },
  },
  { timestamps: true }
);

export default model<ISession>('Session', sessionSchema);
