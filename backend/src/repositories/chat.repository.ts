// repositories/chat.repository.ts
import { injectable } from "inversify";
import { MessageModel, IMessage, ChatSessionModel, IChatSession } from "../models/message.model";

@injectable()
export class ChatRepository {
  async saveMessage(data: Partial<IMessage>): Promise<IMessage> {
    return await MessageModel.create(data);
  }

  async getMessages(sessionId: string, limit = 50): Promise<IMessage[] | null> {
    try {
      console.log('hiting get message in rep')
    let res = 
     await MessageModel.find({ sessionId })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: 1 })
      .limit(limit);
      console.log('repo',res)
      return res;
    } catch (error) {
      console.log('error',error)
    }
  }

  async findOrCreateSession(sessionId: string, participants: string[]): Promise<IChatSession | null> {
    try {
      // console.log("hiting create in repo")
    let session = await ChatSessionModel.findById(sessionId);
    if (!session) {
      session = await ChatSessionModel.create({ _id: sessionId, participants });
    }
    // console.log(session)
    return session;
    } catch (error) {
      console.log('error',error);
    }
  }
}
