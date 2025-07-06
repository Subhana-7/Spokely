import mongoose, { Document, Schema,Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: number;
  password?: string;
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
  isVerified: boolean;
  googleId?:string;
  isGoogleUser?:boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
       type: String,
        required: function(this:{googleId?:string}){
          return !this.googleId;
        },
      },
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
    googleId:{type:String,default:null},
    isGoogleUser:{type:Boolean,default:false},
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
