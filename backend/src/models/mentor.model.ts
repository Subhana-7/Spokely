import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMentor extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: number;
  password?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt?: Date;
  isBlocked: boolean;
  uniqueCode: string;
  sessionsDone: number;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  isVerified: boolean;
  googleId?: string;
  isGoogleUser?: boolean;
}

const mentorSchema = new Schema<IMentor>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function (this: { googleId?: string }) {
        return !this.googleId;
      },
    },
    phone: { type: Number },
    otp: {
      code: { type: String, expiresAt: Date },
    },
    googleId: { type: String, default: null },
    isGoogleUser: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    uniqueCode: { type: String, required: true, unique: true },
    sessionsDone: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IMentor>("Mentor", mentorSchema);