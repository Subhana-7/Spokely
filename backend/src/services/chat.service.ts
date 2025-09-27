import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IMessage } from "../models/message.model";
import { Types } from "mongoose";
import { mapMessageToDto, mapMessagesToDto, } from "../mappers/chat.mapper";
import { IChatPreview, MessageDto } from "../dto/chat.dto";  


@injectable()
export class ChatService { 
  constructor(
    @inject(TYPES.IChatRepository)
    private readonly _chatRepository: IChatRepository
  ) {}

  async sendMessage(
    sessionId: string,
    senderId: string,
    text: string
  ): Promise<MessageDto | null> {
    try {
      console.log('ch')
      const participants = sessionId.split("_"); 
    await this._chatRepository.findOrCreateSession(sessionId, participants);

    const message: IMessage = await this._chatRepository.saveMessage({
      sessionId,
      sender: new Types.ObjectId(senderId),
      text,
    });

    return mapMessageToDto(message);
    } catch (error) {
      console.log("error",error);
      return null
    }
  }

  async getMessages(sessionId: string): Promise<MessageDto[] | null> {
  try {
    const participants = sessionId.split("_"); 
    // await this._chatRepository.findOrCreateSession(sessionId, participants);

    const messages = await this._chatRepository.getMessages(sessionId);
    
    
    return messages;
  } catch (error) {
    console.log("Service error:", error);
    return null;
  }
}


  

  async getChats(userId: string): Promise<IChatPreview[] | null> {
  try {
    const res = await this._chatRepository.getUserChats(userId);
  return res ?? [];
  } catch (error) {
    console.log("error",error)
    return null;
  }
}
}
