import { Server, Socket } from "socket.io";
import container from "./inversify.config";
import { TYPES } from "../types/types";
import { IChatService } from "../services/interfaces/IChatService";

import { INotificationService } from "../services/interfaces/INotificationService";

export const initSocket = (io: Server) => {
  const chatService = container.get<IChatService>(TYPES.IChatService);
  const notificationService = container.get<INotificationService>(
    TYPES.INotificationService
  );

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // ----------CHAT EVENTS ----------

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
        role,
        text,
      }: {
        sessionId: string;
        sender: string;
        role: "user" | "mentor";
        text: string;
      }) => {
        try {
          const msg = await chatService.sendMessage(
            sessionId,
            sender,
            role,
            text
          );

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
            },
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
        console.log(
          `Messages marked as read for user ${userId} in session ${sessionId}`
        );

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

    // ---------- NOTIFICATION EVENTS ----------
    socket.on("register-user", (userId: string) => {
      socket.join(userId); // each user gets their own "room"
      console.log(
        `User ${socket.id} registered for notifications as ${userId}`
      );
    });

    socket.on("notification-read", async (notificationId: string) => {
      try {
        await notificationService.markAsRead(notificationId);
        console.log(`Notification ${notificationId} marked as read`);
      } catch (err) {
        console.error("Notification read error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
