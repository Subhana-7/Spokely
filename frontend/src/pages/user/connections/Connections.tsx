import React, { useEffect, useState } from "react";
import DashboardHeader from "../DashBoardComponents/Header";
import ConnectionsTable from "./ConnectionsTable";
import Button from "../../../modals/Button";
import Input from "../../../modals/Input";
import AddConnectionModal from "./AddConnectionsModal";
import { Search, Plus } from "lucide-react";
import { getAllConnections } from "../../../services/connectionService";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/userAuthStore";

interface Connection {
  id: string; // connection id
  connectedUser: {
    id: string;
    name: string;
    email: string;
    role: "user" | "mentor";
    isBlocked: boolean;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "mentor";
    isBlocked: boolean;
  };
  sessionCount: number;
  status: string;
  isBlocked: boolean;
  blockedBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomingCount, setIncomingCount] = useState(2);

  const currentUserId = useAuthStore((state) => state.user?.id);

  // Fetch all connections
  const fetchConnections = async (term?: string) => {
    try {
      setLoading(true);
      const res = await getAllConnections(term);
      console.log("Fetched connections:", res.data);
      setConnections(res.data);
    } catch (err) {
      toast.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    fetchConnections(searchTerm);
  }, [searchTerm]);

  // ✅ Corrected filteredConnections logic
  const filteredConnections = connections
    .map((c) => {
      const isCurrentUserUser = c.user.id === currentUserId;
      const isCurrentUserConnectedUser = c.connectedUser.id === currentUserId;

      // Determine which side to display
      let displayUser;
      if (isCurrentUserUser) displayUser = c.connectedUser;
      else if (isCurrentUserConnectedUser) displayUser = c.user;
      else return null;

      // Correctly determine who initiated the block
      const blockedByCurrentUser =
        c.isBlocked && c.blockedBy?.id === currentUserId;

      return {
        id: displayUser.id,
        connectionId: c.id,
        username: displayUser.name,
        email: displayUser.email,
        role: displayUser.role,
        sessions: c.sessionCount,
        isBlocked: c.isBlocked,
        blockedByCurrentUser,
      };
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .filter((user) => {
      const name = user.username?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      return (
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase())
      );
    });

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br py-24 from-gray-900 via-gray-800 to-black text-white transition-all duration-300 ${
          isAddModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <DashboardHeader />

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
            Your Connections
          </h2>
          <Button
            variant="primary"
            className="relative px-6 py-3 text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            Add Connection
            {incomingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-md">
                {incomingCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-12 pr-4 py-3 text-sm border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white placeholder-gray-400 shadow-md"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-400 font-medium text-lg">
                Loading connections...
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              <ConnectionsTable connections={filteredConnections} />
            </div>
          )}
        </div>
      </div>

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFetchIncomingCount={setIncomingCount}
      />
    </>
  );
};

export default Connections;
