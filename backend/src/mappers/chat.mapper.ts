import { MessageDto, ChatSessionDto } from "../dto/chat.dto";

export const mapMessageToDto = (message: any): MessageDto => ({
  id: message._id.toString(),
  sessionId: message.sessionId,
  sender: message.sender.toString(),
  text: message.text,
  createdAt: message.createdAt,
});

export const mapMessagesToDto = (messages: any[]): MessageDto[] =>
  messages.map(mapMessageToDto);

export const mapSessionToDto = (session: any): ChatSessionDto => ({
  id: session._id.toString(),
  participants: session.participants.map((p: any) => p.toString()),
  createdAt: session.createdAt,
});
