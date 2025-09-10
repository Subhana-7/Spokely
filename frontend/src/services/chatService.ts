import API from "../api/axios.instance";

export const getMessages = (sessionId: string) => API.get(`/chat/${sessionId}`);
export const sendMessage = (sessionId: string, text: string) =>
  API.post(`/chat/${sessionId}`, { text });
