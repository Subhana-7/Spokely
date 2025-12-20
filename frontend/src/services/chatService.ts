import API from "../api/axios.instance";
import { CHAT_ROUTES as R } from "../constants/routes";

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readBy: string[];
}

export interface GetMessagesResponse {
  message: string;
  messages: Message[];
}

export const getMessages = (sessionId: string) =>
  API.get<GetMessagesResponse>(`${R.base}${R.messages}/${sessionId}`);

export const sendMessage = (sessionId: string, text: string) =>
  API.post(`${R.base}${R.messages}/${sessionId}`, { text });

export const getChatList = () => API.get(`${R.base}${R.all}`);
