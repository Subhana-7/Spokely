import { IChatPreview, MessageDto } from "../../dto/chat.dto";

export interface IChatService {
  sendMessage(
    sessionId: string,
    sender: string,
    text: string
  ): Promise<MessageDto>;

  getMessages(sessionId: string): Promise<MessageDto[] | null>;

  getChats(userId: string): Promise<IChatPreview[]>;
}
