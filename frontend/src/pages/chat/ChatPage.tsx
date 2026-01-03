import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/userAuthStore";
import { getChatList } from "../../services/chatService";
import ChatBox from "./ChatBox";
import { ArrowLeft, MoreVertical, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Header from "../user/DashBoardComponents/Header";
import MentorHeader from "../mentor/DashboardComponents/Header";

const socket = io(import.meta.env.VITE_SERVER_SIDE_URL, { autoConnect: true });

interface Chat {
  id: string;
  role: string;
  name: string;
  lastMessage: string;
  createdAt: string;
  unread: number;
  online?: boolean;
  profilePicture?: string;
}

export default function ChatPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const activeChatRef = useRef<Chat | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!currentUser) return;

    (async () => {
      const res = await getChatList();
      const chatData = res.data.chats.map((chat: any) => ({
        id: chat.id,
        role: chat.role,
        name: chat.name,
        lastMessage: chat.lastMessage || "No messages yet",
        createdAt: chat.createdAt,
        profilePicture: chat.profilePicture,
        unread: 0,
        online: false,
      }));
      setChats(chatData);
      if (chatData.length) setActiveChat(chatData[0]);
    })();

    const handleChatUpdated = ({ sessionId, message }: any) => {
      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat.id === sessionId) {
            const isActive = activeChatRef.current?.id === sessionId;
            const isFromCurrentUser = message.sender?.id === currentUser?.id;

            const unread =
              isActive || isFromCurrentUser ? 0 : (chat.unread || 0) + 1;

            return {
              ...chat,
              lastMessage: message.text,
              createdAt: message.createdAt,
              unread,
            };
          }
          return chat;
        });

        return updatedChats.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    };

    socket.on("chat-updated", handleChatUpdated);

    return () => {
      socket.off("chat-updated", handleChatUpdated);
    };
  }, [currentUser]);

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
    );
  };

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-slate-700 text-white">
      {currentUser?.role === "user" ? <Header /> : <MentorHeader />}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-96 bg-slate-800 border-r border-slate-600 flex flex-col ${
            currentUser?.role === "user" ? "py-18" : ""
          }`}
        >
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-600">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigate(-1)}
                className="p-3 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-700 shadow-md hover:scale-105 hover:shadow-lg transition-all"
              >
                <ArrowLeft size={20} className="text-gray-300" />
              </button>
              <h1 className="text-xl font-semibold">Chats</h1>
              <button className="p-2 hover:bg-slate-700 rounded-full">
                <MoreVertical size={20} className="text-gray-300" />
              </button>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-700 border-b border-slate-600 ${
                  activeChat?.id === chat.id ? "bg-slate-700" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {chat.profilePicture ? (
                      <img
                        src={chat.profilePicture}
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center font-semibold">
                        {chat.name.charAt(0)}
                      </div>
                    )}
                    {chat.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-800 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-400">
                        {new Date(chat.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-sm truncate ${
                          chat.unread > 0
                            ? "text-white font-medium"
                            : "text-gray-300"
                        }`}
                      >
                        {chat.lastMessage}
                      </p>
                      {chat.unread > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-emerald-500 text-white rounded-full min-w-[20px] text-center">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1">
          {activeChat ? (
            <ChatBox
              key={activeChat.id}
              socket={socket}
              chatId={activeChat.id}
              chatRole={activeChat.role}
              chatName={activeChat.name}
              profilePicture={activeChat.profilePicture}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-slate-800">
              <div className="w-64 h-64 bg-slate-700 rounded-full flex items-center justify-center mb-8">
                <div className="text-6xl">💬</div>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome to Chat
              </h2>
              <p className="text-center max-w-md">
                Select a chat from the sidebar to start messaging with your
                mentors and students.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
