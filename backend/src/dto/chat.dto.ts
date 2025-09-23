export interface MessageDto {
  id: string;
  sessionId: string;
  text: string;
  createdAt: Date;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
    role: "user" | "mentor";
  };
}


export interface ChatSessionDto {
  id: string;
  participants: string[];
  createdAt: Date;
}

export interface IChatPreview {
  id: string;
  name: string;
  role: "user" | "mentor";
  profilePicture: string | null;
  lastMessage: string | null;
  lastMessageSender: string | null;
  createdAt: Date;
}
