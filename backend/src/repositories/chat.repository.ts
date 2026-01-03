import { injectable } from "inversify";
import {
  MessageModel,
  IMessage,
  ChatSessionModel,
  IChatSession,
} from "../models/message.model";
import { BaseRepository } from "./base.repository";
import { IUser } from "../models/user.model";
import mentorModel from "../models/mentor.model";
import userModel from "../models/user.model";
import { IChatPreview, MessageDto } from "../dto/chat.dto";
import { Types } from "mongoose";
import { IMentor } from "../models/mentor.model";

@injectable()
export class ChatRepository extends BaseRepository<IMessage> {
  constructor() {
    super(MessageModel);
  }

  async saveMessage(data: Partial<IMessage>): Promise<IMessage | null> {
    try {
      const msg = await MessageModel.create({
        sessionId: data.sessionId,
        sender: data.sender,
        senderModel: data.senderModel,
        text: data.text,
      });

      await ChatSessionModel.findByIdAndUpdate(data.sessionId, {
        $set: { updatedAt: new Date() },
      });

      return msg;
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async getMessages(sessionId: string): Promise<MessageDto[] | null> {
    try {
      const res = await MessageModel.find({ sessionId })
        .populate({
          path: "sender",
          select: "name profilePicture role",
        })
        .sort({ createdAt: 1 })
        .lean();

      console.log(
        res.map((m) => ({
          text: m.text,
          sender: m.sender,
        }))
      );

      const messages: MessageDto[] = res.map((msg: any) => ({
        _id: msg._id.toString(),
        id: msg._id.toString(),
        sessionId: msg.sessionId,
        text: msg.text,
        createdAt: msg.createdAt,
        sender: msg.sender
          ? {
              _id: msg.sender._id.toString(),
              id: msg.sender._id.toString(),
              name: msg.sender.name,
              profilePicture: msg.sender.profilePicture || null,
              role: msg.sender.role || "user",
            }
          : {
              _id: "unknown",
              id: "unknown",
              name: "Unknown Sender",
              profilePicture: null,
              role: "mentor",
            },
      }));

      return messages;
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.log("error", error);
      return null;
    }
  }

  async getUserChats(id: string): Promise<IChatPreview[] | null> {
    try {
      const sessions = await ChatSessionModel.find({
        participants: new Types.ObjectId(id),
      }).sort({ updatedAt: -1 });

      const chats = await Promise.all(
        sessions.map(async (session) => {
          const otherParticipantId = session.participants.find(
            (p) => p.toString() !== id
          );

          let otherUser: IUser | IMentor | null = null;

          otherUser = await userModel
            .findById(otherParticipantId)
            .select("name role profilePicture")
            .lean();

          if (!otherUser) {
            otherUser = await mentorModel
              .findById(otherParticipantId)
              .select("name role profilePicture")
              .lean();
          }

          const lastMessage = await MessageModel.findOne({
            sessionId: session._id,
          })
            .sort({ createdAt: -1 })
            .populate("sender", "name")
            .lean();

          const unreadCount = await MessageModel.countDocuments({
            sessionId: session._id,
            sender: { $ne: id },
            readBy: { $ne: id },
          });

          return {
            id: session._id,
            name: otherUser?.name || "Unknown",
            role: otherUser?.role || "user",
            profilePicture: otherUser?.profilePicture || null,
            lastMessage: lastMessage?.text || null,
            lastMessageSender: (lastMessage?.sender as any)?.name || null,
            createdAt: lastMessage?.createdAt || session.updatedAt,
            unread: unreadCount,
          };
        })
      );

      return chats;
    } catch (err) {
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
    } catch (err: unknown) {
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
