import { useEffect, useState } from "react";
import DashboardHeader from "../DashBoardComponents/Header";
import ConnectionsTable from "./ConnectionsTable";
import Button from "../../../modals/Button";
import Input from "../../../modals/Input";
import AddConnectionModal from "./AddConnectionsModal";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllConnections } from "../../../services/connectionService";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../store/userAuthStore";

interface Connection {
  id: string;
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
  const [status, setStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomingCount, setIncomingCount] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const currentUserId = useAuthStore((state) => state.user?.id);

  const fetchConnections = async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      const res = await getAllConnections(params);

      const connectionsData = res.data.connections || res.data || [];
      const totalCount = res.data.total || connectionsData.length || 0;
      const pagesCount =
        res.data.totalPages ||
        Math.ceil(totalCount / (params?.limit || limit)) ||
        1;

      setConnections(connectionsData);
      setTotal(totalCount);
      setTotalPages(pagesCount);

    } catch (err: any) {
      toast.error("Failed to fetch connections");
      console.error("Fetch error:", err);
      setConnections([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections({ page: 1, limit });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchConnections({
        search: searchTerm,
        status,
        page,
        limit,
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm, status, page]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [searchTerm, status]);

  const formattedConnections = connections
    .map((c) => {
      const isCurrentUserUser = c.user?.id === currentUserId;
      const isCurrentUserConnectedUser = c.connectedUser?.id === currentUserId;
      if (!isCurrentUserUser && !isCurrentUserConnectedUser) return null;

      const displayUser = isCurrentUserUser ? c.connectedUser : c.user;
      if (!displayUser) return null;

      const blockedByCurrentUser =
        c.isBlocked && c.blockedBy?.id === currentUserId;

      return {
        id: displayUser.id,
        connectionId: c.id,
        username: displayUser.name,
        email: displayUser.email,
        role: displayUser.role,
        sessions: c.sessionCount || 0,
        status: c.status,
        isBlocked: c.isBlocked,
        blockedByCurrentUser,
      };
    })
    .filter(Boolean) as any[];

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

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

        {/* Search & Filter */}
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="relative w-full md:w-1/2">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search connections..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-12 pr-4 py-3 text-sm border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white placeholder-gray-400 shadow-md w-full"
            />
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-full px-5 py-3 focus:ring-2 focus:ring-green-500 shadow-md"
            >
              <option value="all">All</option>
              <option value="accepted">Accepted</option>
              <option value="pending_sent">Pending Sent</option>
              <option value="pending_received">Pending Received</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-400 font-medium text-lg">
              Loading connections...
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-6">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl shadow-lg p-6 border border-white/10">
              {formattedConnections.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  No connections found
                </div>
              ) : (
                <>
                  <ConnectionsTable connections={formattedConnections} />

                  {/* Pagination Controls - Always show if there's data */}
                  {total > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-700 pt-4">
                      <div className="text-sm text-gray-400">
                        Showing {Math.min((page - 1) * limit + 1, total)} to{" "}
                        {Math.min(page * limit, total)} of {total} connection
                        {total !== 1 ? "s" : ""}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={page === 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            page === 1
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          <ChevronLeft size={16} />
                          Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                    page === pageNum
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>

                        <button
                          onClick={handleNextPage}
                          disabled={page === totalPages}
                          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            page === totalPages
                              ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                          }`}
                        >
                          Next
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
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
