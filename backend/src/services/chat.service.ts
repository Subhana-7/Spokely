import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IChatRepository } from "../repositories/interfaces/IChatRepository";
import { IMessage } from "../models/message.model";
import { Types } from "mongoose";
import { mapMessageToDto } from "../mappers/chat.mapper";
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
    role: "user" | "mentor",
    text: string
  ): Promise<MessageDto | null> {
    try {
      console.log(
        `[ChatService] Sending message to session ${sessionId} from ${senderId}`
      );

      const participants = sessionId.split("_");
      await this._chatRepository.findOrCreateSession(sessionId, participants);

      const message: IMessage | null = await this._chatRepository.saveMessage({
        sessionId,
        sender: new Types.ObjectId(senderId),
        senderModel: role === "mentor" ? "Mentor" : "User",
        text,
        createdAt: new Date(),
      });

      if (!message) {
        console.error(
          "[ChatService] Failed to save message - repository returned null"
        );
        return null;
      }

      console.log(`[ChatService] Message saved with ID: ${message._id}`);

      const dto = mapMessageToDto(message);
      console.log("[ChatService] Mapped DTO:", JSON.stringify(dto));

      return dto;
    } catch (error: unknown) {
      console.error("[ChatService] Error in sendMessage:", error);
      return null;
    }
  }

  async getMessages(sessionId: string): Promise<MessageDto[] | null> {
    try {
      console.log(`[ChatService] Fetching messages for session ${sessionId}`);
      const messages = await this._chatRepository.getMessages(sessionId);
      console.log(`[ChatService] Retrieved ${messages?.length || 0} messages`);
      return messages;
    } catch (error: unknown) {
      console.error("[ChatService] Error in getMessages:", error);
      return null;
    }
  }

  async getChats(userId: string): Promise<IChatPreview[] | null> {
    try {
      return (await this._chatRepository.getUserChats(userId)) ?? [];
    } catch (error: unknown) {
      console.error("[ChatService] Error in getChats:", error);
      return null;
    }
  }

  async markMessagesRead(sessionId: string, userId: string): Promise<void> {
    try {
      await this._chatRepository.markMessagesRead(sessionId, userId);
    } catch (error: unknown) {
      console.error("[ChatService] Error in markMessagesRead:", error);
    }
  }
}
