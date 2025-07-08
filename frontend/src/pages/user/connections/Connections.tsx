import React, { useEffect, useState } from "react";
import DashboardHeader from "../DashBoardComponents.jsx/Header";
import ConnectionsTable from "./ConnectionsTable";
import Button from "../../../modals/Button";
import Input from "../../../modals/Input";
import AddConnectionModal from "./AddConnectionsModal";
import { Search, Plus } from "lucide-react";
import { getAllConnections } from "../../../services/connection.service";
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
  const [loading, setLoading] = useState(true);
  const [incomingCount, setIncomingCount] = useState(0);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await getAllConnections();
      setConnections(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const filteredConnections = connections.filter((connection) => {
    const user = connection.connectedUserId;
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      {/* Main Page - Will blur when modal is open */}
      <div
        className={`min-h-screen bg-sky-100 transition-all duration-300 ${
          isAddModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <DashboardHeader />
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-lime-200 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-gray-800 tracking-wide">
                CONNECTIONS
              </h1>
              <div className="relative">
                <Button
                  variant="secondary"
                  className="bg-olive-600 hover:bg-olive-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 relative"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={20} className="mr-2" />
                  Add Connection
                  {incomingCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {incomingCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="relative mb-6">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(val: string) => setSearchTerm(val)}
                className="pl-10 w-full bg-white border-0 rounded-xl py-3 text-base shadow-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="text-center py-20 text-gray-500 font-medium">
                Loading connections...
              </div>
            ) : (
              <ConnectionsTable
                connections={filteredConnections.map((c) => {
                  const user = c.connectedUserId;
                  return {
                    id: user._id,
                    username: user.name,
                    email: user.email,
                    role: user.role === "mentor" ? "Mentor" : "Peer",
                    sessions: c.sessionCount || 0,
                  };
                })}
              />
            )}
          </div>
        </div>
      </div>

      {/* ✅ Add Modal Here - OUTSIDE Blur Zone */}
      <AddConnectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFetchIncomingCount={(count: number) => setIncomingCount(count)}
      />
    </>
  );
};

export default Connections;
