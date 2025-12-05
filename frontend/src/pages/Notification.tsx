import { useEffect, useState } from "react";
import { CheckCircle, Bell } from "lucide-react";
import Button from "../modals/Button";
import DashboardHeader from "./user/DashBoardComponents/Header";
import Header from "./mentor/DashboardComponents/Header";
import { useAuthStore } from "../store/userAuthStore";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notificationService";

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(notifications);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user?.role === "user" ? <DashboardHeader /> : <Header />}

      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Notifications
          </h1>

          {notifications.length > 0 && (
            <Button
              variant="secondary"
              className="px-4 py-2 rounded-full text-sm"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Bell size={48} className="mb-4 opacity-60 animate-pulse" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Bell size={48} className="mb-4 opacity-60" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {notifications.map((note) => (
              <div
                key={note.id}
                onClick={() => handleMarkAsRead(note.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  note.isRead
                    ? "bg-gray-800/60 border-gray-700"
                    : "bg-green-500/10 border-green-500/30"
                } hover:bg-gray-800/80`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{note.title}</h3>
                    <p className="text-gray-400 text-sm">{note.message}</p>
                    <span className="text-xs text-gray-500 mt-2 block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {note.isRead && (
                    <CheckCircle
                      size={18}
                      className="text-green-400 mt-1 shrink-0"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
