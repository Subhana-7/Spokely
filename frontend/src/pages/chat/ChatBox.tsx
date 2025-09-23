import { io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { getMessages } from "../../services/chatService";
import { useAuthStore } from "../../store/userAuthStore";
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, TypeIcon } from "lucide-react";

const socket = io(import.meta.env.VITE_SERVER_SIDE_URL);

interface Message {
  id: string;
  sender: { 
    id: string; 
    name?: string; 
    profilePicture?: string;
    role?: string;
  };
  text: string;
  createdAt: string;
}

interface ChatBoxProps {
  chatId: string;
  chatRole: string;
  chatName: string;
}

export default function ChatBox({ chatId, chatRole, chatName }: ChatBoxProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!currentUser) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const senderId = currentUser.id;

  // Helper to safely parse sender
  const parseSender = (sender: any) => {
    if (!sender) return { id: "", name: "", profilePicture: "", role: "user" };
    if (typeof sender === "string") {
      try {
        return JSON.parse(sender);
      } catch {
        return { id: sender, name: "", profilePicture: "", role: "user" };
      }
    }
    return sender;
  };

  useEffect(() => {
    if (!chatId) return;

    // Fetch messages from backend
    getMessages(chatId).then((res) => {
      const msgs: Message[] = res.data.messages.map((m: any) => ({
        id: m.id || m._id,
        sender: parseSender(m.sender),
        text: m.text,
        createdAt: m.createdAt,
      }));
      setMessages(msgs);
    });

    // Join socket room
    socket.emit("join-room", chatId);

    // Listen for incoming messages
    socket.on("chat-message", (msg: any) => {
      if (!msg) return;

      const newMsg: Message = {
        id: msg.id || msg._id,
        sender: parseSender(msg.sender),
        text: msg.text,
        createdAt: msg.createdAt,
      };

      // Prevent duplicates
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMsg.id);
        if (exists) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      socket.off("chat-message");
    };
  }, [chatId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    // Only use socket
    socket.emit("chat-message", {
      sessionId: chatId,
      sender: senderId,
      text: input,
    });

    setInput("");
  };

  return (
    // Only changes: background, text colors, input, buttons, message bubbles
<div className="h-full flex flex-col bg-slate-800 text-white">
  {/* Header */}
  <div className="bg-slate-900 px-6 py-4 border-b border-slate-600 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-semibold">
          {chatName.charAt(0)}
        </div>
        <div>
          <h2 className="font-semibold">{chatName}</h2>
          <p className="text-sm text-gray-400">Online</p>
        </div>
      </div>
    </div>
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    {messages.map((message, index) => {
      const isCurrentUser = message.sender.id === senderId;
      const showSenderName = !isCurrentUser && 
        (index === 0 || messages[index - 1].sender.id !== message.sender.id);

      return (
        <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-xs md:max-w-md flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
            {showSenderName && (
              <div className="px-2 mb-1">
                <span className="text-xs text-gray-400 font-medium">
                  {message.sender.name || "Unknown User"}
                </span>
              </div>
            )}
            
            <div className={`px-4 py-2 rounded-lg shadow-sm ${
              isCurrentUser
                ? "bg-emerald-500 text-white rounded-br-none"
                : "bg-slate-700 text-gray-300 rounded-bl-none border border-slate-600"
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <div className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-200" : "text-gray-400"}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      );
    })}
    <div ref={messagesEndRef} />
  </div>

  {/* Input */}
  <div className="bg-slate-900 px-4 py-3 border-t border-slate-600">
    <div className="flex items-center space-x-3">
      <div className="flex-1 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white placeholder-gray-400"
        />
      </div>
      {input.trim() ? (
        <button
          onClick={sendMessage}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors"
        >
          <Send size={20} className="text-white" />
        </button>
      ) : (
        <button className="p-2 hover:bg-slate-700 rounded-full">
          <TypeIcon size={24} className="text-gray-400" />
        </button>
      )}
    </div>
  </div>
</div>

  );
}