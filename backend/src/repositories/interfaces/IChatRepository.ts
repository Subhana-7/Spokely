import { IMessage,IChatSession } from "../../models/message.model";

export interface IChatRepository {
  saveMessage(data: Partial<IMessage>): Promise<IMessage>;
  getMessages(sessionId: string, limit:number): Promise<IMessage[] | null>;
  findOrCreateSession(sessionId: string, participants: string[]): Promise<IChatSession | null>
}