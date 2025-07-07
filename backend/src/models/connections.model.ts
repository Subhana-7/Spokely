import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConnection extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  connectedUserId: Types.ObjectId;
  sessionCount: number;
  levelsUnlocked: number;
  isBlocked: boolean;
  isRemoved: boolean;
  createdAt: Date;
  requests: Types.ObjectId[];
}

const connectionSchema = new Schema<IConnection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    connectedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionCount: {
      type: Number,
      default: 0,
    },
    levelsUnlocked: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
    requests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IConnection>("Connection", connectionSchema);
