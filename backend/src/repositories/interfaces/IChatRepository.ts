import { IChatPreview, MessageDto } from "../../dto/chat.dto";
import { IMessage, IChatSession } from "../../models/message.model";

export interface IChatRepository {
  saveMessage(data: Partial<IMessage>): Promise<IMessage>;
  getMessages(sessionId: string, limit?: number): Promise<MessageDto[] | null>;
  findOrCreateSession(
    sessionId: string,
    participants: string[]
  ): Promise<IChatSession | null>;
  getUserChats(userId: string):Promise<IChatPreview[] | null>
}
