import API from "../api/axios.instance";

export const getMessages = (sessionId: string) => API.get(`/chat/messages/${sessionId}`);
export const sendMessage = (sessionId: string, text: string) =>
  API.post(`/chat/messages/${sessionId}`, { text });

export const getChatList = () => API.get(`/chat/all`);