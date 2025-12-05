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
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle size={40} className="text-red-500" />
            <h3 className="text-lg font-semibold text-white">
              {confirmModal.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {confirmModal.message}
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() =>
                setConfirmModal((prev) => ({ ...prev, isOpen: false }))
              }
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition"
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

  const handleBlockToggle = async (
    connectionId: string,
    isBlocked: boolean
  ) => {
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
          setConnState((prev) =>
            prev.map((c) =>
              c.connectionId === connectionId
                ? {
                    ...c,
                    isBlocked: !isBlocked,
                    blockedByCurrentUser: !isBlocked,
                  }
                : c
            )
          );
          setTimeout(() => window.location.reload(), 500);
        } catch (err) {
          console.error(err);
        }
      },
    });
  };

  const handleRemove = async (connectionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Connection?",
      message: "Are you sure you want to remove this connection permanently?",
      onConfirm: async () => {
        try {
          const res = await removeConnection(connectionId);
          if (!res.data) throw new Error("Failed to remove connection");
          setConnState((prev) =>
            prev.filter((c) => c.connectionId !== connectionId)
          );
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
      <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
        {/* Header Row */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6 border-b border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 font-semibold text-gray-300 text-sm uppercase tracking-wider">
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

        {/* Data Rows */}
        <div className="divide-y divide-gray-800">
          {connState.map((connection, index) => (
            <div
              key={connection.connectionId}
              className={`p-8 ${
                index % 2 === 0 ? "bg-gray-900/50" : "bg-gray-800/40"
              } hover:bg-gray-700/40 transition-all duration-300 group`}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                {/* User Info */}
                <Link
                  to={`/user-profile/${connection.id}`}
                  className="flex items-center gap-4 hover:opacity-90 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {connection.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-lg">
                      {connection.username}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Mail size={12} />
                      {connection.email}
                    </div>
                  </div>
                </Link>

                {/* Role */}
                <div className="md:block">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      connection.role === "mentor"
                        ? "bg-purple-900/40 text-purple-300 border border-purple-700"
                        : "bg-blue-900/40 text-blue-300 border border-blue-700"
                    }`}
                  >
                    {connection.role}
                  </span>
                  <div className="md:hidden text-sm text-gray-400 mt-2">
                    {connection.sessions} sessions completed
                  </div>
                </div>

                {/* Sessions */}
                <div className="hidden md:block">
                  <div className="text-2xl font-bold text-white">
                    {connection.sessions}
                  </div>
                  <div className="text-sm text-gray-500">sessions</div>
                </div>

                {/* Status */}
                <div className="hidden md:block">
                  {connection.isBlocked && !connection.blockedByCurrentUser ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-900/40 text-red-400 border border-red-700">
                      <ShieldBan size={12} /> Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-900/40 text-green-400 border border-green-700">
                      <CheckCircle size={12} /> Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 md:justify-center justify-start">
                  <Button
                    onClick={() => handleChat(connection.id, connection.role)}
                    variant="primary"
                    className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:scale-105 transition"
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
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        <Ban size={16} className="mr-2" /> Unblock
                      </Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-900/40 text-red-400 border border-red-700">
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
                      className="px-4 py-2 text-sm bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
                    >
                      <Ban size={16} className="mr-2" /> Block
                    </Button>
                  )}

                  <Button
                    onClick={() => handleRemove(connection.connectionId)}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <Trash2 size={16} className="mr-2" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {connState.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Users size={32} className="text-gray-500" />
            </div>
            <div className="text-xl font-medium mb-2">No connections found</div>
            <div className="text-sm text-gray-500">
              Try searching again or add new connections
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal />
    </>
  );
};

export default ConnectionsTable;
