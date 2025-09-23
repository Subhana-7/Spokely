// chat.mapper.ts

import { MessageDto } from "../dto/chat.dto";

export function mapMessageToDto(message: any): MessageDto {
  // Check if message and sender exist
  if (!message || !message.sender) {
    throw new Error("Invalid message data");
  }

  return {
    id: message._id.toString(),
    sessionId: message.sessionId,
    text: message.text,
    createdAt: message.createdAt,
    sender: {
      id: message.sender._id.toString(),
      name: message.sender.name || 'Unknown User',
      profilePicture: message.sender.profilePicture || null,
      role: message.sender.role || 'user',
    },
  };
}

export function mapMessagesToDto(messages: any[]): MessageDto[] {
  return messages
    .filter(msg => msg && msg.sender && msg.sender._id) // Filter out invalid messages
    .map(mapMessageToDto);
}