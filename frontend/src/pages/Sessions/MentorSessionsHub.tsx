import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Badge from "../../components/common/Badge";
import SpokelyCard from "../../components/common/Cards";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Toggle from "../../modals/Toggle";
import MentorHeader from "../mentor/DashboardComponents/Header";
import { getSessions } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type SessionStatus = "pending" | "upcoming" | "accepted" | "completed" | "cancelled";

const statusLabels: Record<SessionStatus, string> = {
  pending: "Pending Approval",
  upcoming: "Upcoming",
  accepted: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface Session {
  sessionFee: number;
  _id: string;
  topic: string;
  type: string;
  description?: string;
  status: SessionStatus;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  participants?: any[];
  createdBy?: any;
  mentorId?: any;
}

const SessionsHub: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState<string>("all"); // status filter
  const [typeFilter, setTypeFilter] = useState<string>("all"); // session type filter
  const [search, setSearch] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [stats, setStats] = useState({
    thisWeek: 0,
    today: 0,
    total: 0,
    completionRate: 0,
  });

  // Pagination state returned from server
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9); // change per page if you want
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    setCurrentUserId(userId);
  }, []);

  // Fetch sessions from backend with filters, search and pagination
  const fetchSessions = async (opts?: { page?: number }) => {
    setLoading(true);
    try {
      const p = opts?.page ?? page;
      const res = await getSessions({
        search: search || undefined,
        status: filter === "all" ? undefined : filter,
        type: typeFilter === "all" ? undefined : typeFilter,
        page: p,
        limit,
      });

      // many APIs return data differently; handle both shapes:
      // { sessions, total, page, totalPages }  OR  res.data.sessions
      const payload = res.data || {};
      const serverSessions =
        (payload.sessions as any[]) ||
        (Array.isArray(payload) ? (payload as any[]) : payload.sessions);

      // If API returned a wrapped object with pagination fields:
      if (payload.sessions && Array.isArray(payload.sessions)) {
        setSessions(payload.sessions);
        setTotalItems(Number(payload.total ?? payload.totalItems ?? 0));
        setPage(Number(payload.page ?? p));
        setTotalPages(Number(payload.totalPages ?? Math.ceil((payload.total ?? 0) / limit)));
        calculateStats(payload.sessions);
      } else if (Array.isArray(serverSessions)) {
        // fallback
        setSessions(serverSessions as Session[]);
        calculateStats(serverSessions as Session[]);
        setTotalItems(serverSessions.length);
        setTotalPages(1);
        setPage(1);
      } else {
        setSessions([]);
        setTotalItems(0);
        setTotalPages(1);
        setPage(1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sessionsList: Session[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const todaySessions = sessionsList.filter(
      (s) => s.startTime && new Date(s.startTime) >= today
    );
    const thisWeekSessions = sessionsList.filter(
      (s) => s.startTime && new Date(s.startTime) >= weekStart
    );

    const completed = sessionsList.filter((s) => s.status === "completed");
    const completionRate =
      sessionsList.length > 0 ? Math.round((completed.length / sessionsList.length) * 100) : 0;

    setStats({
      thisWeek: thisWeekSessions.length,
      today: todaySessions.length,
      total: sessionsList.length,
      completionRate,
    });
  };

  // initial fetch and whenever filters/search/page change
  useEffect(() => {
    // reset to page 1 when filters/search change
    setPage(1);
    fetchSessions({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, typeFilter, search]);

  // If only page changes (e.g., next/prev), fetch the new page
  useEffect(() => {
    fetchSessions({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleScheduleButton = () => {
    navigate("/mentor/schedule-session");
  };

  function renderActionButtons(session: Session) {
    const now = new Date().getTime();
    const start = session.startTime ? new Date(session.startTime).getTime() : 0;
    const end = session.endTime
      ? new Date(session.endTime).getTime()
      : start + (session.durationMinutes || 60) * 60 * 1000;

    const isOngoing = now >= start && now <= end;
    const isCompleted = now > end;

    if (session.status === "cancelled") {
      return <p className="text-sm text-red-400">This session was cancelled</p>;
    }

    if (isCompleted) {
      return (
        <div className="flex flex-col gap-2 mt-3">
          <Button onClick={() => navigate(`/session/details/${session._id}`)} variant="secondary">
            View Details
          </Button>
          <p className="text-sm text-green-400 font-semibold">Completed</p>
        </div>
      );
    }

    if (isOngoing) {
      return (
        <div className="flex flex-col gap-2 mt-3">
          <Button onClick={() => navigate(`/session/details/${session._id}`)} variant="secondary">
            View Details
          </Button>
          <Button onClick={() => navigate(`/session/${session._id}/video`)} variant="primary">
            Join Session
          </Button>
        </div>
      );
    }

    // upcoming / default
    return (
      <div className="flex flex-col gap-2 mt-3">
        <Button onClick={() => navigate(`/session/details/${session._id}`)} variant="secondary">
          View Details
        </Button>
      </div>
    );
  }

  // Pagination helpers
  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };
  const goTo = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return (
    <div className="min-h-screen bg-slate-700">
      <MentorHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Sessions Hub</h1>
          <p className="text-gray-300">Manage all your sessions in one place</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SpokelyCard className="bg-slate-800 text-center">
            <p className="text-gray-400">This Week</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.thisWeek}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center">
            <p className="text-gray-400">Today</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.today}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center">
            <p className="text-gray-400">Total (page)</p>
            <p className="text-2xl font-bold text-emerald-400">{sessions.length}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center">
            <p className="text-gray-400">Completion Rate</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.completionRate}%</p>
          </SpokelyCard>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <Toggle
            options={[
              { value: "all", label: "All" },
              { value: "upcoming", label: "Upcoming" },
              { value: "accepted", label: "Accepted" },
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            selected={filter}
            onChange={(val) => setFilter(val)}
          />

          {/* Session Type select (private/public/peer-to-peer/all) */}
          <div className="flex items-center gap-2">
            <label className="text-gray-300 mr-2">Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 text-white border border-gray-600 px-3 py-1 rounded"
            >
              <option value="all">All</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="peer-to-peer">Peer-to-peer</option>
            </select>
          </div>

          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search by topic or type"
              value={search}
              onChange={(val) => setSearch(val)}
              rightIcon={<Search size={18} />}
              className="bg-slate-800 text-white border-gray-600 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Session Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12 text-gray-400">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">No sessions found</div>
          ) : (
            sessions.map((session) => (
              <SpokelyCard key={session._id} className="bg-slate-800 text-white">
                <div className="flex justify-between items-center mb-3">
                  <Badge variant={session.status}>
                    {session.startTime ? new Date(session.startTime).toLocaleString() : "No time set"}
                  </Badge>
                  <Badge variant={session.status} size="sm" className="capitalize">
                    {statusLabels[session.status]}
                  </Badge>
                </div>
                <h3 className="font-bold text-black">{session.topic}</h3>
                <p className="text-sm text-black">{session.type}</p>
                {session.description && <p className="text-sm text-gray-400 mt-2">{session.description}</p>}
                {renderActionButtons(session)}
              </SpokelyCard>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-50"
              disabled={page <= 1}
            >
              Prev
            </button>

            {/* simple page buttons (show up to 5 centered) */}
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, idx) => {
                // calculate a centered window around current page
                const windowSize = Math.min(totalPages, 7);
                let start = Math.max(1, page - Math.floor(windowSize / 2));
                if (start + windowSize - 1 > totalPages) start = Math.max(1, totalPages - windowSize + 1);
                const pNum = start + idx;
                if (pNum > totalPages) return null;
                return (
                  <button
                    key={pNum}
                    onClick={() => goTo(pNum)}
                    className={`px-3 py-1 rounded ${pNum === page ? "bg-emerald-500 text-white" : "bg-slate-800 text-white"}`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={goNext}
              className="px-3 py-1 bg-slate-800 text-white rounded disabled:opacity-50"
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* small footer info */}
        <div className="mt-4 text-center text-gray-400">
          Showing page {page} of {totalPages} • {totalItems} total sessions (server)
        </div>
      </div>

      {/* Floating Button (Create) */}
      <button
        onClick={handleScheduleButton}
        className="fixed bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg transition hover:scale-110"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default SessionsHub;
