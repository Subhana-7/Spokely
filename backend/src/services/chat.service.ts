// services/chat.service.ts
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ChatRepository } from "../repositories/chat.repository";
import { IMessage ,IChatSession} from "../models/message.model";

@injectable()
export class ChatService {
  constructor(
    @inject(TYPES.IChatRepository)
    private readonly chatRepo: ChatRepository
  ) {}

  async sendMessage(sessionId: string, sender: string, text: string): Promise<IMessage> {
    return await this.chatRepo.saveMessage({ sessionId, sender, text });
  }

  async getMessages(sessionId: string, participants: string[]): Promise<IMessage[]> {
    // ensure session exists
    await this.chatRepo.findOrCreateSession(sessionId, participants);

    // fetch messages
    let res = await this.chatRepo.getMessages(sessionId);
    console.log(res)
    return res; 
  }
}
