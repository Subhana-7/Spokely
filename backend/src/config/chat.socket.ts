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

    socket.on("leave-room", (sessionId: string) => {
      socket.leave(sessionId);
      console.log(`User ${socket.id} left room ${sessionId}`);
    });

    socket.on(
      "chat-message",
      async ({
        sessionId,
        sender,
        text,
      }: {
        sessionId: string;
        sender: string;
        text: string;
      }) => {
        try {
          const msg = await chatService.sendMessage(sessionId, sender, text);

          if (!msg) {
            throw new Error("Failed to save message");
          }

          const outgoing = {
            id: msg.id || msg._id,
            sender: msg.sender,
            text: msg.text,
            createdAt: msg.createdAt,
            sessionId,
          };

          io.in(sessionId).emit("chat-message", outgoing);

          io.emit("chat-updated", { 
            sessionId, 
            message: {
              text: outgoing.text,
              createdAt: outgoing.createdAt,
              sender: outgoing.sender,
            }
          });

          console.log(`Message sent in room ${sessionId}:`, outgoing.id);
        } catch (err) {
          console.error("Socket sendMessage error:", err);

          socket.emit("chat-error", {
            error: "Failed to send message",
            sessionId,
          });
        }
      }
    );

    socket.on("mark-read", async ({ sessionId, userId }) => {
      try {
        await chatService.markMessagesRead(sessionId, userId);
        console.log(`Messages marked as read for user ${userId} in session ${sessionId}`);

        io.in(sessionId).emit("messages-read", {
          sessionId,
          userId,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Mark read error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};