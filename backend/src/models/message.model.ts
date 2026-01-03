import { Schema, model, Types, Document } from "mongoose";

/* -------------------- MESSAGE MODEL -------------------- */
export interface IMessage extends Document {
  sessionId: string;
  sender: Types.ObjectId;
  senderModel: string;
  text: string;
  createdAt: Date;
  updatedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sessionId: { type: String, ref: "ChatSession", required: true },
    sender: {
      type: Schema.Types.ObjectId,
      refPath: "senderModel",
      required: true,
    },
    text: { type: String, required: true },
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Mentor"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MessageModel = model<IMessage>("Message", messageSchema);

/* -------------------- CHAT SESSION MODEL -------------------- */

export interface IChatSession extends Document {
  _id: string;
  participants: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  senderModel: string;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    _id: { type: String, required: true },
    participants: [
      { type: Schema.Types.ObjectId, refPath: "senderModel", required: true },
    ],
    senderModel: {
      type: String,
      required: true,
      enum: ["User", "Mentor"],
    },
  },
  { timestamps: true }
);

export const ChatSessionModel = model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);
