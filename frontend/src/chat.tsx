import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getMessages } from "./services/chatService";
import { useAuthStore } from "./store/userAuthStore";
import { userProfiles, mentorProfile } from "./services/authServices";

const socket = io(import.meta.env.VITE_SERVER_SIDE_URL);

interface Message {
  _id: string;
  sender: { id: string; name?: string };
  text: string;
}

export default function ChatBox() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role");
  const currentUser = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUser, setChatUser] = useState<{ name: string } | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const senderId = (currentUser as any)?._id || currentUser?.id;
  const sessionId = currentUser && id ? [senderId, id].sort().join("_") : null;

  useEffect(() => {
    if (!id || !role) return;

    const fetchChatUser = async () => {
      try {
        let data;
        if (role === "user") {
          data = await userProfiles(id);
        } else if (role === "mentor") {
          data = await mentorProfile(id);
        }
        setChatUser(data);
      } catch (err) {
        console.error("Failed to fetch chat user:", err);
      }
    };

    fetchChatUser();
  }, [id, role]);

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

  if (!currentUser)
    return (
      <p className="text-center text-gray-400 pt-20">Loading user...</p>
    );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header (fixed) */}
      <div className="fixed top-0 left-0 right-0 z-10 px-6 py-4 border-b border-white/10 backdrop-blur-lg bg-white/5 shadow-lg">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Chat with {chatUser?.name || "Unknown"}
        </h2>
      </div>

      {/* Messages (scrollable area) */}
      <div className="flex-1 overflow-y-auto px-6 py-24 space-y-4">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`flex ${
              m.sender?.id === senderId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-2xl shadow-lg backdrop-blur-lg border border-white/10 ${
                m.sender?.id === senderId
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-none"
                  : "bg-white/10 text-gray-200 rounded-bl-none"
              }`}
            >
              <p className="text-xs opacity-75 mb-1">{m.sender?.name}</p>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input (fixed bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-6 py-4 border-t border-white/10 backdrop-blur-lg bg-white/5 flex items-center gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 text-sm rounded-full bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:scale-105 transform transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
