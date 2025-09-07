import { IMessage } from "../../models/message.model";

export interface IChatService {
  sendMessage(
    sessionId: string,
    sender: string,
    text: string
  ): Promise<IMessage>;
  getMessages(sessionId: string, participants: string[]): Promise<IMessage[]>;
}
