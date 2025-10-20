import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../modals/Button";
import {
  MessageCircle,
  Ban,
  Trash2,
  User,
  Users,
  Clock,
  Mail,
  CheckCircle,
  ShieldBan,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  blockUnblockUser,
  removeConnection,
} from "../../../services/connectionService";

interface Connection {
  id: string;
  connectionId: string;
  username: string;
  email: string;
  role: string;
  sessions: number;
  isBlocked: boolean;
  blockedByCurrentUser: boolean;
}

interface ConnectionsTableProps {
  connections: Connection[];
}

const ConnectionsTable: React.FC<ConnectionsTableProps> = ({ connections }) => {
  const navigate = useNavigate();
  const [connState, setConnState] = React.useState(connections);

  const [confirmModal, setConfirmModal] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  React.useEffect(() => {
    setConnState(connections);
  }, [connections]);

 const ConfirmationModal = () =>
  confirmModal.isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle size={40} className="text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            {confirmModal.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {confirmModal.message}
          </p>
        </div>

        {/* ✅ Buttons clearly visible */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() =>
              setConfirmModal((prev) => ({ ...prev, isOpen: false }))
            }
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              confirmModal.onConfirm();
              setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  ) : null;


  // ✅ Block / Unblock Handler
  const handleBlockToggle = async (connectionId: string, isBlocked: boolean) => {
    setConfirmModal({
      isOpen: true,
      title: isBlocked ? "Unblock User?" : "Block User?",
      message: isBlocked
        ? "Are you sure you want to unblock this user?"
        : "Are you sure you want to block this user? They won't be able to message you.",
      onConfirm: async () => {
        try {
          const res = await blockUnblockUser(connectionId, isBlocked);
          if (!res.data) throw new Error("Failed to update block status");

          // Optional: local update before reload
          setConnState((prev) =>
            prev.map((c) =>
              c.connectionId === connectionId
                ? { ...c, isBlocked: !isBlocked, blockedByCurrentUser: !isBlocked }
                : c
            )
          );

          // Refresh the page to ensure backend consistency
          setTimeout(() => window.location.reload(), 500);
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  // ✅ Remove Handler
  const handleRemove = async (connectionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Connection?",
      message: "Are you sure you want to remove this connection permanently?",
      onConfirm: async () => {
        try {
          const res = await removeConnection(connectionId);
          if (!res.data) throw new Error("Failed to remove connection");

          // Optional: local update before reload
          setConnState((prev) =>
            prev.filter((c) => c.connectionId !== connectionId)
          );

          // Refresh to re-fetch updated data
          setTimeout(() => window.location.reload(), 500);
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const handleChat = (id: string, role: string) => {
    navigate(`/user/chat/${id}?role=${role.toLowerCase()}`);
  };

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200/50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-semibold text-gray-700 text-sm uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <User size={16} /> Contact
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Users size={16} /> Role
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Clock size={16} /> Sessions
            </div>
            <div className="hidden md:block">Status</div>
            <div className="hidden md:block text-center">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {connState.map((connection, index) => (
            <div
              key={connection.connectionId}
              className={`p-8 ${
                index % 2 === 0 ? "bg-white/50" : "bg-gray-50/30"
              } hover:bg-blue-50/40 transition-all duration-300 group`}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                <Link
                  to={`/user-profile/${connection.id}`}
                  className="flex items-center gap-4 hover:opacity-80 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {connection.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {connection.username}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Mail size={12} />
                      {connection.email}
                    </div>
                  </div>
                </Link>

                <div className="md:block">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      connection.role === "mentor"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {connection.role}
                  </span>
                  <div className="md:hidden text-sm text-gray-500 mt-2">
                    {connection.sessions} sessions completed
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="text-2xl font-bold text-gray-900">
                    {connection.sessions}
                  </div>
                  <div className="text-sm text-gray-500">sessions</div>
                </div>

                <div className="hidden md:block">
                  {connection.isBlocked && !connection.blockedByCurrentUser ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      <ShieldBan size={12} /> Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} /> Active
                    </span>
                  )}
                </div>

                {/* --- Actions --- */}
                <div className="flex flex-wrap gap-2 md:justify-center justify-start">
                  <Button
                    onClick={() => handleChat(connection.id, connection.role)}
                    variant="primary"
                    className="px-4 py-2 text-sm text-black"
                    disabled={connection.isBlocked}
                  >
                    <MessageCircle size={16} className="mr-2" /> Chat
                  </Button>

                  {connection.isBlocked ? (
                    connection.blockedByCurrentUser ? (
                      <Button
                        onClick={() =>
                          handleBlockToggle(
                            connection.connectionId,
                            connection.isBlocked
                          )
                        }
                        variant="success"
                        className="px-4 py-2 text-sm text-black"
                      >
                        <Ban size={16} className="mr-2" /> Unblock
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded text-sm font-medium bg-red-100 text-red-800">
                        <ShieldBan size={16} /> Blocked
                      </span>
                    )
                  ) : (
                    <Button
                      onClick={() =>
                        handleBlockToggle(
                          connection.connectionId,
                          connection.isBlocked
                        )
                      }
                      variant="warning"
                      className="px-4 py-2 text-sm text-black"
                    >
                      <Ban size={16} className="mr-2" /> Block
                    </Button>
                  )}

                  <Button
                    onClick={() => handleRemove(connection.connectionId)}
                    variant="danger"
                    className="px-4 py-2 text-sm text-black"
                  >
                    <Trash2 size={16} className="mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {connState.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Users size={32} className="text-gray-400" />
            </div>
            <div className="text-gray-500 text-xl font-medium mb-2">
              No connections found
            </div>
            <div className="text-gray-400 text-sm">
              Try adjusting your search criteria or add new connections
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal />
    </>
  );
};

export default ConnectionsTable;
