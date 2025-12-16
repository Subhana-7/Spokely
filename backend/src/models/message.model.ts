import { Schema, model, Types } from "mongoose";

/* -------------------- MESSAGE MODEL -------------------- */

export interface IMessage {
  sessionId: string;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sessionId: { type: String, ref: "ChatSession", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MessageModel = model<IMessage>("Message", messageSchema);

/* -------------------- CHAT SESSION MODEL -------------------- */

export interface IChatSession {
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: true }
);

export const ChatSessionModel = model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);
