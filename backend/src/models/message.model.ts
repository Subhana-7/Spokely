import { Schema, model, Types, Document } from "mongoose";

/* -------------------- MESSAGE MODEL -------------------- */
export interface IMessage extends Document {
  sessionId: string;
  sender: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt?:Date;
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

export interface IChatSession extends Document {
  _id: string;
  participants: Types.ObjectId[];
  createdAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    _id: { type: String, required: true },
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatSessionModel = model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);
