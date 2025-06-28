import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: number;
  password: string;
  role: "user" | "mentor";
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isBlocked: Boolean;
  referalCode: string;
  levels?: number;
  completionRate?: number;
  streak?: number;
  sessionsDone: number;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  isVerified: Boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number },
    role: {
      type: String,
      enum: ["user", "mentor"],
      default: "user",
      required: true,
    },
    otp: {
      code: { type: String, expiresAt: Date },
    },
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    referalCode: { type: String, required: true, unique: true },
    sessionsDone: { type: Number, default: 0 },
    levels: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
