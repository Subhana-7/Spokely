import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IMessage } from "../models/message.model";
import { Types } from "mongoose";
import { mapMessageToDto, mapMessagesToDto, mapSessionToDto } from "../mappers/chat.mapper";
import { MessageDto } from "../dto/chat.dto";  


@injectable()
export class ChatService {
  constructor(
    @inject(TYPES.IChatRepository)
    private readonly chatRepo: IChatRepository
  ) {}

  async sendMessage(
    sessionId: string,
    senderId: string,
    text: string
  ): Promise<MessageDto> {
    const participants = sessionId.split("_"); // ✅ moved here
    await this.chatRepo.findOrCreateSession(sessionId, participants);

    const message: IMessage = await this.chatRepo.saveMessage({
      sessionId,
      sender: new Types.ObjectId(senderId),
      text,
    });

    return mapMessageToDto(message);
  }

  async getMessages(sessionId: string): Promise<MessageDto[]> {
    const participants = sessionId.split("_"); // ✅ moved here
    await this.chatRepo.findOrCreateSession(sessionId, participants);

    const messages = await this.chatRepo.getMessages(sessionId);
    return mapMessagesToDto(messages ?? []);
  }
}
