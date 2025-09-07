import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getMessages } from "./services/chatService";
import { useAuthStore } from "./store/userAuthStore";

const socket = io(import.meta.env.VITE_SERVER_SIDE_URL);

interface Message {
  _id: string;
  sender: { id: string; name?: string };
  text: string;
}

export default function ChatBox() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderId = (currentUser as any)?._id || currentUser?.id;
  const sessionId = currentUser && id ? [senderId, id].sort().join("_") : null;

  useEffect(() => {
    if (!sessionId) return;

    socket.emit("join-room", sessionId);

    getMessages(sessionId).then((res) => setMessages(res.data.messages));

    socket.on("chat-message", (msg: Message) =>
      setMessages((prev) => [...prev, msg])
    );

    return () => {
      socket.off("chat-message");
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !sessionId || !currentUser) return;
    socket.emit("chat-message", {
      sessionId,
      sender: senderId,
      text: input,
    });
    setInput("");
  };

  if (!currentUser) {
    return <p className="text-center text-gray-500">Loading user...</p>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-white shadow-md border-b">
        <h2 className="font-semibold text-lg">
          Chat with {id}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.sender?.id === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl shadow ${
                m.sender?.id === senderId
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{m.sender?.name || "Unknown"}</p>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring focus:border-blue-400"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
