import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ChatService } from "../services/chat.service";
import { IChatService } from "../services/interfaces/IChatService";

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.IChatService) private readonly chatService: IChatService
  ) {}

  getMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;

      const participants = sessionId.split("_");

      const messages = await this.chatService.getMessages(
        sessionId,
        participants
      );
      res.json({ messages });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body;
      const sender = req.id!;

      if (!sender) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const message = await this.chatService.sendMessage(
        sessionId,
        sender,
        text
      );
      res.json({ message });
    } catch (err) {
      res.status(500).json({ message: "Failed to send message" });
    }
  };
}
