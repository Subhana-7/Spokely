import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ChatRepository } from "../repositories/chat.repository";
import { IMessage, IChatSession } from "../models/message.model";
import { Types } from "mongoose";

@injectable()
export class ChatService {
  constructor(
    @inject(TYPES.IChatRepository)
    private readonly chatRepo: ChatRepository
  ) {}

  async sendMessage(
    sessionId: string,
    sender: string,
    text: string
  ): Promise<IMessage> {
    return await this.chatRepo.saveMessage({
      sessionId,
      sender: new Types.ObjectId(sender),
      text,
    });
  }

  async getMessages(
    sessionId: string,
    participants: string[]
  ): Promise<IMessage[]> {
    await this.chatRepo.findOrCreateSession(sessionId, participants);

    const messages = await this.chatRepo.getMessages(sessionId);
    return messages ?? [];
  }
}
