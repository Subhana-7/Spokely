import { X } from "lucide-react";
import Button from "../modals/Button";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
}

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationModal = ({
  open,
  onClose,
  notifications,
  onMarkAsRead,
}: NotificationModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/95 text-white border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md  relative
                   top-1/2 transform -translate-y-1/2 mt-250 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Notifications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notification List */}
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No new notifications</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {notifications.map((note) => (
              <div
                key={note.id}
                onClick={() => onMarkAsRead && onMarkAsRead(note.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  note.read
                    ? "bg-gray-800/60 border-gray-700"
                    : "bg-green-500/10 border-green-500/30"
                } hover:bg-gray-800/80`}
              >
                <h3 className="font-semibold text-white">{note.title}</h3>
                <p className="text-gray-400 text-sm">{note.message}</p>
                <span className="text-xs text-gray-500 mt-2 block">{note.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 text-center">
          <Button
            variant="secondary"
            className="px-6 py-2 rounded-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};


export default NotificationModal;
