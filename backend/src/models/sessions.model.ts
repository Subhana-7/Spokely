import { Schema, model, Types, Document } from "mongoose";

export interface IFeedback {
  from: Types.ObjectId;
  to: Types.ObjectId;
  comment: string;
  rating?: number;
}

export interface IParticipant {
  user: Types.ObjectId;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  cancelReason?: string;
}

export interface IFlag {
  flaggedBy: Types.ObjectId;
  againstUser?: Types.ObjectId;
  reason: string;
  createdAt?: Date;
}

export interface ISession extends Document {
  type: "public" | "private" | "peer-to-peer";
  topic: string;
  description: string;
  mentorId?: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  status:
    | "pending"
    | "upcoming"
    | "accepted"
    | "completed"
    | "cancelled"
    | "flagged";
  createdBy: Types.ObjectId;
  createdByModel: string;
  participants: IParticipant[];
  durationMinutes?: number;
  recordingLink?: string;
  feedback?: IFeedback[];
  flags?: IFlag[];
  sessionFee?: number;
  cancelReason?: string;
}

const participantSchema = new Schema<IParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String },
  },
  { _id: false }
);

const feedbackSchema = new Schema<IFeedback>(
  {
    from: { type: Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number },
  },
  { _id: false }
);

const flagSchema = new Schema<IFlag>(
  {
    flaggedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    againstUser: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sessionSchema = new Schema<ISession>(
  {
    type: {
      type: String,
      enum: ["public", "private", "peer-to-peer"],
      required: true,
    },
    topic: { type: String, required: true },
    description: { type: String, required: true },
    mentorId: { type: Schema.Types.ObjectId, ref: "User" },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "upcoming",
        "accepted",
        "completed",
        "cancelled",
        "flagged",
      ],
      default: "pending",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["User", "Mentor"],
    },

    participants: [participantSchema],
    durationMinutes: { type: Number, default: 60 },
    recordingLink: { type: String },
    feedback: [feedbackSchema],
    flags: [flagSchema],
    sessionFee: { type: Number, default: 0 },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

sessionSchema.index({ createdBy: 1, status: 1 });
sessionSchema.index({ "participants.user": 1, status: 1 });
sessionSchema.index({ mentorId: 1, status: 1 });
sessionSchema.index({ startTime: 1, status: 1 });

export default model<ISession>("Session", sessionSchema);
