import { Server, Socket } from "socket.io";
import container from "../config/inversify.config";
import { TYPES } from "../types/types";
import { IChatService } from "../services/interfaces/IChatService";

export const initChatSocket = (io: Server) => {
  const chatService = container.get<IChatService>(TYPES.IChatService);

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (sessionId: string) => {
      socket.join(sessionId);
    });

    socket.on("chat-message", async ({ sessionId, sender, text }) => {
      const msg = await chatService.sendMessage(sessionId, sender, text);
      io.to(sessionId).emit("chat-message", msg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
