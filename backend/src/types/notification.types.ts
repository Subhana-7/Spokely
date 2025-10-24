import { Document, Types } from "mongoose";

export interface NotificationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  isRead: boolean;
  createdAt: Date;
}
