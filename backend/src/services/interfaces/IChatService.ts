import { IChatPreview, MessageDto } from "../../dto/chat.dto";

export interface IChatService {
  sendMessage(
    sessionId: string,
    sender: string,
    text: string
  ): Promise<MessageDto | null>;

  getMessages(sessionId: string): Promise<MessageDto[] | null>;

  getChats(userId: string): Promise<IChatPreview[] | null>;

  markMessagesRead(sessionId: string, userId: string): Promise<void>;
}
