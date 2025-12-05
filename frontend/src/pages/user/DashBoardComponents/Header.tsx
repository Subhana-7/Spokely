import { useState, useEffect } from "react";
import { Bell, MessageCircle, User, Wallet } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../../store/userAuthStore";
import { logoutService } from "../../../services/authServices";
import {
  getNotifications,
} from "../../../services/notificationService";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const [notifications, setNotifications] = useState<any[]>([]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (user?.id) {
      const fetchNotifications = async () => {
        try {
          const data = await getNotifications(user.id);
          setNotifications(
            data.map((n: any) => ({
              id: n._id,
              title: n.title,
              message: n.message,
              time: new Date(n.createdAt).toLocaleString(),
              read: n.isRead,
            }))
          );
        } catch (err) {
          console.error("Error fetching notifications:", err);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logoutService("user");
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const navButtonClass = (path: string) =>
    `text-gray-200 font-medium px-3 py-2 rounded-lg transition-colors ${
      location.pathname === path
        ? "text-white bg-white/20"
        : "hover:text-white hover:bg-white/10"
    }`;

  return (
    <header className="fixed top-0 w-full z-20 bg-black/30 backdrop-blur-md border-b border-white/20 mb-[60rem]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          onClick={() => navigate("/user/home")}
          className="text-2xl font-bold text-white cursor-pointer drop-shadow-lg"
        >
          Spokely
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => navigate("/user/home")}
            className={navButtonClass("/user/home")}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/user/session")}
            className={navButtonClass("/user/session")}
          >
            Sessions
          </button>
          <button
            onClick={() => navigate("/user/mentors")}
            className={navButtonClass("/user/mentors")}
          >
            Mentors
          </button>
          <button
            onClick={() => navigate("/user/connections")}
            className={navButtonClass("/user/connections")}
          >
            Connections
          </button>
        </nav>

        {/* Icons + Logout */}
        <div className="flex items-center space-x-3">
          {/* Chat */}
          <button
            onClick={() => navigate("/user/chat")}
            className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <MessageCircle size={20} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => navigate("/notifications")}
              className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-xs w-4 h-4 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Wallet */}
          <button
            onClick={() => navigate("/wallet")}
            className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Wallet size={20} />
          </button>

          <button
            onClick={() => navigate("/user/subscription/history")}
            className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Wallet size={20} />
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/user/profile")}
            className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <User size={20} />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
