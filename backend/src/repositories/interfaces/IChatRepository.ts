import { IChatPreview, MessageDto } from "../../dto/chat.dto";
import { IMessage, IChatSession } from "../../models/message.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IChatRepository extends IBaseRepository<IMessage> {
  saveMessage(data: Partial<IMessage>): Promise<IMessage | null>;
  getMessages(sessionId: string, limit?: number): Promise<MessageDto[] | null>;
  findOrCreateSession(
    sessionId: string,
    participants: string[]
  ): Promise<IChatSession | null>;
  getUserChats(userId: string): Promise<IChatPreview[] | null>;
  markMessagesRead(sessionId: string, userId: string): Promise<void>;
  getUnreadCount(sessionId: string, userId: string): Promise<number>;
}
