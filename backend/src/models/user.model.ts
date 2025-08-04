import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  role: any;
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: number;
  password?: string;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isBlocked: boolean;
  uniqueCode?: string;
  levels?: number;
  completionRate?: number;
  streak?: number;
  sessionsDone: number;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  // New field for forgot password
  forgotPasswordOtp?: {
    code: string;
    expiresAt: Date;
    newPassword: string;
  };
  isVerified: boolean;
  googleId?: string;
  isGoogleUser?: boolean;
}

const userSchema = new Schema<IUser>(
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
      code: { type: String },
      expiresAt: { type: Date }
    },
    // New field for forgot password functionality
    forgotPasswordOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      newPassword: { type: String }
    },
    googleId: { type: String, default: null },
    isGoogleUser: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    profilePicture: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    uniqueCode: { type: String, unique: true },
    sessionsDone: { type: Number, default: 0 },
    levels: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);