import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import DashboardHeader from "../user/DashBoardComponents/Header";
import { getSessions, cancelSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/userAuthStore";

const Sessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [cancelModal, setCancelModal] = useState<{
    open: boolean;
    id?: string;
  }>({ open: false });
  const [cancelReason, setCancelReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const userId = useAuthStore((state) => state.user?.id!);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res?.data?.sessions ?? res?.data ?? [];
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to load sessions";
      toast.error(message);
      setSessions([]); 
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim() || !userId) {
      toast.error("Please enter a reason");
      return;
    }
    if (!cancelModal.id) {
      toast.error("Invalid session id");
      return;
    }
    try {
      await cancelSession(userId, cancelModal.id as string, cancelReason);
      toast.success("Session cancelled");
      setCancelModal({ open: false });
      setCancelReason("");
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel session");
    }
  };

  const renderStatus = (session: any) => {
    if (!session) return "unknown";
    const now = Date.now();
    const start = session.startTime ? new Date(session.startTime).getTime() : 0;
    const end = session.endTime
      ? new Date(session.endTime).getTime()
      : start + (session.durationMinutes || 60) * 60 * 1000;

    if (session.status === "cancelled") return "cancelled";
    if (now > end && end > 0) return "completed";
    if (now >= start && now <= end) return "on-going";
    return "upcoming";
  };

  const filteredSessions = sessions.filter((s) => {
    if (!s) return false;
    const matchesSearch = String(s.topic ?? "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || renderStatus(s) === statusFilter;
    const matchesType = typeFilter === "all" || s.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
            Your Sessions
          </h2>
          <Button
            variant="primary"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg"
            onClick={() => navigate("/user/schedule-session")}
          >
            <Plus size={18} className="mr-2" />
            Schedule Session
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search by topic..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="pl-12 pr-4 py-3 text-sm border border-gray-700 rounded-full bg-gray-800 text-white placeholder-gray-400 shadow-md"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="on-going">On-going</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="peer-to-peer">Peer-to-peer</option>
            </select>
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No sessions found</p>
            <Button
              variant="success"
              className="px-6 py-3 rounded-full"
              onClick={() => navigate("/user/schedule-session")}
            >
              Schedule a Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session, idx) => {
              const id = session?._id ?? session?.id ?? `missing-${idx}`;
              const status = renderStatus(session);
              return (
                <Card
                  key={id}
                  className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 hover:shadow-green-500/20 transition-all duration-300"
                >
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg truncate text-white">
                        {session?.topic ?? "Untitled session"}
                      </h3>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            session?.type === "public"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : session?.type === "private"
                              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                              : "bg-blue-500/20 text-white border border-blue-500/30"
                          }
                        >
                          {session?.type ?? "—"}
                        </Badge>

                        <Badge
                          className={
                            status === "completed"
                              ? "bg-green-500/20 text-green-300 border border-green-500/30"
                              : status === "on-going"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                              : status === "cancelled"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          }
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-300 mb-1">
                    {session?.startTime
                      ? new Date(session.startTime).toLocaleString()
                      : "—"}
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    Created By:{" "}
                    {session?.createdBy?._id === userId
                      ? "You"
                      : session?.createdBy?.name || "Unknown"}
                  </p>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => {
                        console.log(id);
                        if (!id || String(id).startsWith("missing-")) {
                          toast.error(
                            "Cannot open details (missing session id)"
                          );
                          return;
                        }
                        navigate(`/session/details/${id}`);
                      }}
                      variant="secondary"
                    >
                      View Details
                    </Button>

                    {status === "on-going" ? (
                      <Button
                        onClick={() => {
                          if (!id || String(id).startsWith("missing-")) {
                            toast.error("Cannot join (missing session id)");
                            return;
                          }
                          navigate(`/session/${id}/video`);
                        }}
                        variant="success"
                      >
                        Join Session
                      </Button>
                    ) : status === "upcoming" ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          if (!id || String(id).startsWith("missing-")) {
                            toast.error("Cannot cancel (missing session id)");
                            return;
                          }
                          setCancelModal({ open: true, id });
                        }}
                      >
                        Cancel Session
                      </Button>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-96 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">
              Cancel Session
            </h2>
            <Input
              type="text"
              placeholder="Enter reason..."
              value={cancelReason}
              onChange={setCancelReason}
              className="w-full mb-4 bg-gray-800 text-white border-gray-700"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setCancelModal({ open: false })}
              >
                Close
              </Button>
              <Button variant="danger" onClick={handleCancelConfirm}>
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
