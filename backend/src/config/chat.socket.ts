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
      console.log(`User ${socket.id} joined room ${sessionId}`);
    });

    socket.on(
      "chat-message",
      async ({ sessionId, sender, text }: { sessionId: string; sender: string; text: string }) => {
        try {
          const msg = await chatService.sendMessage(sessionId, sender, text);

          if (msg) {
            io.to(sessionId).emit("chat-message", msg);
          } else {
            io.to(sessionId).emit("chat-message", {
              id: new Date().getTime().toString(),
              sender: { _id: sender },
              text,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Socket sendMessage error:", err);

          io.to(sessionId).emit("chat-message", {
            id: new Date().getTime().toString(),
            sender: { _id: sender },
            text,
            createdAt: new Date().toISOString(),
          });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
