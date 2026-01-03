import { Response } from "express";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { IChatService } from "../services/interfaces/IChatService";
import { STATUS_CODES, MESSAGES } from "../utilis/constants";

@injectable()
export class ChatController {
  constructor(
    @inject(TYPES.IChatService) private readonly _chatService: IChatService
  ) {}

  getMessages = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const messages = await this._chatService.getMessages(sessionId);
      res
        .status(STATUS_CODES.OK)
        .json({ messages, message: MESSAGES.SUCCESS.SESSIONS_FETCHED });
    } catch (err: unknown) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  sendMessage = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { text, role } = req.body;
      const sender = req.id!;

      if (!sender) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.UNAUTHORIZED });
      }

      const message = await this._chatService.sendMessage(
        sessionId,
        sender,
        role,
        text
      );
      console.log(message);
      res
        .status(STATUS_CODES.OK)
        .json({ message, info: MESSAGES.SUCCESS.USER_FETCHED });
    } catch (err: unknown) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };

  getChats = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.id!;

      if (!userId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.ERROR.UNAUTHORIZED });
      }

      const chats = await this._chatService.getChats(userId);

      res
        .status(STATUS_CODES.OK)
        .json({ chats, message: MESSAGES.SUCCESS.SESSIONS_FETCHED });
    } catch (err: unknown) {
      console.error("Error fetching chats:", err);
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: MESSAGES.ERROR.SERVER_ERROR });
    }
  };
}
