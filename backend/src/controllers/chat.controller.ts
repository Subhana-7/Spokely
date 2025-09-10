import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IChatService } from "../services/interfaces/IChatService";
import { StatusCode } from "../utilis/status.code";

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.IChatService) private readonly chatService: IChatService
  ) {}

  getMessages = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { sessionId } = req.params;
      const messages = await this.chatService.getMessages(sessionId);
      res.status(StatusCode.OK).json({ messages });
    } catch (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch messages" });
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<Response | void> => {
    try {
      const { sessionId } = req.params;
      const { text } = req.body;
      const sender = req.id!;

      if (!sender) {
        return res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
      }

      const message = await this.chatService.sendMessage(sessionId, sender, text);
      res.status(StatusCode.OK).json({ message });
    } catch (err) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to send message" });
    }
  };
}
