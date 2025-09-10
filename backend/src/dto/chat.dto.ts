export interface MessageDto {
  id: string;
  sessionId: string;
  sender: string;
  text: string;
  createdAt: Date;
}

export interface ChatSessionDto {
  id: string;
  participants: string[];
  createdAt: Date;
}
