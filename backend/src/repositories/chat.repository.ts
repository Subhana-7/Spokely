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
      return await MessageModel.create(data);
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }


async getMessages(sessionId: string, limit = 50): Promise<MessageDto[] | null> {
  try {
    const res = await MessageModel.find({ sessionId })
      .populate("sender", "name profilePicture role")
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    console.log("Raw MongoDB data:", res);

    // Transform and return MessageDto array
    const messages = res
      .filter((msg: any) => msg.sender && msg.sender._id)
      .map((msg: any) => ({
        id: msg._id.toString(),
        sessionId: msg.sessionId,
        text: msg.text,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender._id.toString(),
          name: msg.sender.name || 'Unknown User',
          profilePicture: msg.sender.profilePicture || null,
          role: msg.sender.role || 'user',
        },
      }));

    console.log("Transformed messages:", JSON.stringify(messages, null, 2));
    return messages;
  } catch (error) {
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
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }



  async getUserChats(userId: string):Promise<IChatPreview[] | null> {
  try {
    const sessions = await ChatSessionModel.find({
      participants: userId,
    })
      .populate<{ participants: IUser[] }>({
        path: "participants",
        select: "name role profilePicture",
      })
      .sort({ createdAt: -1 });

    const chats = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await MessageModel.findOne({
          sessionId: session._id,
        })
          .sort({ createdAt: -1 })
          .populate("sender", "name");

        // now TypeScript knows these are IUser[]
        const otherUser = session.participants.find(
          (p) => p._id.toString() !== userId.toString()
        ) as IUser | undefined;

        return {
          id: session._id,
          name: otherUser?.name || "Unknown",
          role: otherUser?.role || "user",
          profilePicture: otherUser?.profilePicture || null,
          lastMessage: lastMessage?.text || null,
          lastMessageSender: (lastMessage?.sender as unknown as IUser)?.name || null,
          createdAt: session.createdAt,
        };
      })
    );

    return chats;
  } catch (err) {
    console.error("Error fetching user chats:", err);
    return [];
  }
}

}