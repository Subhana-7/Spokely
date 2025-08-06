import React, { useEffect, useState } from "react";
import DashboardHeader from "../DashBoardComponents.jsx/Header";
import ConnectionsTable from "./ConnectionsTable";
import Button from "../../../modals/Button";
import Input from "../../../modals/Input";
import AddConnectionModal from "./AddConnectionsModal";
import { Search, Plus } from "lucide-react";
import { getAllConnections } from "../../../services/connectionService";
import toast from "react-hot-toast";

interface Connection {
  connectedUserId: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "mentor";
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "mentor";
  };
  sessionCount: number;
  status: string;
}

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomingCount, setIncomingCount] = useState(2);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const res = await getAllConnections();
        setConnections(res.data); // make sure res.data is an array
      } catch (err) {
        toast.error("Failed to fetch connections");
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, []);

  const filteredConnections = connections
    .filter((connection) => {
      const user = connection.connectedUserId;
      return (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .map((c) => {
      const user = c.connectedUserId;
      return {
        id: user._id,
        username: user.name,
        email: user.email,
        role: user.role === "mentor" ? "Mentor" : "Peer",
        sessions: c.sessionCount || 0,
      };
    });

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-all duration-300 ${
          isAddModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Header */}
        <DashboardHeader />
        <div>
          <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Your Connections
            </h2>
            <Button
              variant="primary"
              className="px-8 py-4 text-lg relative shadow-2xl hover:scale-105 transform transition-all bg-blue-400 rounded-2xl"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} className="mr-3" />
              Add Connection
              {incomingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full px-3 py-1 shadow-lg animate-pulse">
                  {incomingCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-12 pr-4 py-4 text-lg shadow-lg bg-white/90"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-gray-500 font-medium text-lg">
                Loading connections...
              </div>
            </div>
          ) : (
            <ConnectionsTable connections={filteredConnections} />
          )}
        </div>
      </div>

      <AddConnectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFetchIncomingCount={setIncomingCount}
      />
    </>
  );
};

export default Connections;
