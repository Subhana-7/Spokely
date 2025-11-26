import { useEffect, useState } from "react";
import { CheckCircle, Bell } from "lucide-react";
import Button from "../modals/Button";
import DashboardHeader from "./user/DashBoardComponents/Header";
import Header from "./mentor/DashboardComponents/Header"
import { useAuthStore } from "../store/userAuthStore"; // assuming you store user details here

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
  const user = useAuthStore((state) => state.user); // Example: { id, name, email }

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/notifications/${user?.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // if auth needed
        },
      });

      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Call each PATCH in parallel
      await Promise.all(
        notifications
          .filter((n) => !n.isRead)
          .map((n) =>
            fetch(`http://localhost:5000/api/notifications/${n.id}/read`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
            })
          )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {user?.role === "user" ? <DashboardHeader /> : <Header/>}

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
