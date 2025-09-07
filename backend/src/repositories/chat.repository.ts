import { injectable } from "inversify";
import {
  MessageModel,
  IMessage,
  ChatSessionModel,
  IChatSession,
} from "../models/message.model";

@injectable()
export class ChatRepository {
  async saveMessage(data: Partial<IMessage>): Promise<IMessage> {
    return await MessageModel.create(data);
  }

  async getMessages(sessionId: string, limit = 50): Promise<IMessage[] | null> {
    try {
      let res = await MessageModel.find({ sessionId })
        .populate("sender", "name profilePicture")
        .sort({ createdAt: 1 })
        .limit(limit);
      return res;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async findOrCreateSession(
    sessionId: string,
    participants: string[]
  ): Promise<IChatSession | null> {
    try {
      let session = await ChatSessionModel.findById(sessionId);
      if (!session) {
        session = await ChatSessionModel.create({
          _id: sessionId,
          participants,
        });
      }
      return session;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }
}
