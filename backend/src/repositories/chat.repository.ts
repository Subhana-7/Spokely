import { injectable } from "inversify";
import {
  MessageModel,
  IMessage,
  ChatSessionModel,
  IChatSession,
} from "../models/message.model";
import { BaseRepository } from "./base.repository";
import { IUser } from "../models/user.model";
import { IChatPreview, MessageDto } from "../dto/chat.dto";

@injectable()
export class ChatRepository extends BaseRepository<IMessage> {
  constructor() {
    super(MessageModel);
  }

  async saveMessage(data: Partial<IMessage>): Promise<IMessage | null> {
    try {
      const msg = await MessageModel.create(data);
      await ChatSessionModel.findByIdAndUpdate(data.sessionId, {
        $set: { updatedAt: new Date() },
      });
      return msg;
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async getMessages(
    sessionId: string,
    limit = 50
  ): Promise<MessageDto[] | null> {
    try {
      const res = await MessageModel.find({ sessionId })
        .populate("sender", "name profilePicture role")
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();

      const messages: MessageDto[] = res
        .filter((msg: any) => msg.sender && msg.sender._id)
        .map((msg: any) => ({
          _id: msg._id.toString(),
          id: msg._id.toString(),
          sessionId: msg.sessionId,
          text: msg.text,
          createdAt: msg.createdAt,
          sender: {
            _id: msg.sender._id.toString(),
            id: msg.sender._id.toString(),
            name: msg.sender.name || "Unknown User",
            profilePicture: msg.sender.profilePicture || null,
            role: msg.sender.role || "user",
          },
        }));

      return messages;
    } catch (error:unknown) {
      console.log("Repository error:", error);
      return null;
    }
  }

  async findOrCreateSession(
    sessionId: string,
    participants: string[]
  ): Promise<IChatSession | null> {
    try {
      let session = await ChatSessionModel.findById(sessionId);
      if (!session) {
        session = await ChatSessionModel.create({
          _id: sessionId,
          participants,
        });
      }
      return session;
    } catch (error:unknown) {
      console.log("error", error);
      return null;
    }
  }

  async getUserChats(userId: string): Promise<IChatPreview[] | null> {
    try {
      const sessions = await ChatSessionModel.find({
        participants: userId,
      })
        .populate<{ participants: IUser[] }>({
          path: "participants",
          select: "name role profilePicture",
        })
        .sort({ updatedAt: -1 });

      const chats = await Promise.all(
        sessions.map(async (session) => {
          const [lastMessage, unreadCount] = await Promise.all([
            MessageModel.findOne({ sessionId: session._id })
              .sort({ createdAt: -1 })
              .populate("sender", "name"),
            MessageModel.countDocuments({
              sessionId: session._id,
              sender: { $ne: userId },
              readBy: { $ne: userId },
            }),
          ]);

          const otherUser = session.participants.find(
            (p) => p._id.toString() !== userId.toString()
          ) as IUser | undefined;

          return {
            id: session._id,
            name: otherUser?.name || "Unknown",
            role: otherUser?.role || "user",
            profilePicture: otherUser?.profilePicture || null,
            lastMessage: lastMessage?.text || null,
            lastMessageSender:
              (lastMessage?.sender as unknown as IUser)?.name || null,
            createdAt: lastMessage?.createdAt || session.updatedAt,
            unread: unreadCount || 0,
          };
        })
      );

      return chats;
    } catch (err:unknown) {
      console.error("Error fetching user chats:", err);
      return [];
    }
  }

  async markMessagesRead(sessionId: string, userId: string): Promise<void> {
    try {
      await MessageModel.updateMany(
        { sessionId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
    } catch (err:unknown) {
      console.error("Error marking messages as read:", err);
    }
  }

  async getUnreadCount(sessionId: string, userId: string): Promise<number> {
    return await MessageModel.countDocuments({
      sessionId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    });
  }
}
