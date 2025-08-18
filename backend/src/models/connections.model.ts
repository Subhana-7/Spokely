import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IConnection extends Document {
  userId: Types.ObjectId;
  connectedUserId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  sessionCount: number;
  levelsUnlocked: number;
  isBlocked: boolean;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const connectionSchema = new Schema<IConnection>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    connectedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    sessionCount: { type: Number, default: 0 },
    levelsUnlocked: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

connectionSchema.index(
  { userId: 1, connectedUserId: 1 },
  { unique: true }
);
connectionSchema.index(
  { userId: 1, connectedUserId: -1 },
  { unique: true }
);

export default mongoose.model<IConnection>("Connection", connectionSchema);
