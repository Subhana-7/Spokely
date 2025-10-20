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
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [stats, setStats] = useState({
    thisWeek: 0,
    today: 0,
    total: 0,
    completionRate: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    setCurrentUserId(userId);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res.data?.sessions || res.data;
      if (Array.isArray(data)) {
        setSessions(data as Session[]);
        calculateStats(data as Session[]);
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    }
  };

  const calculateStats = (sessions: Session[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const todaySessions = sessions.filter(
      (s) => s.startTime && new Date(s.startTime) >= today
    );
    const thisWeekSessions = sessions.filter(
      (s) => s.startTime && new Date(s.startTime) >= weekStart
    );

    const completed = sessions.filter((s) => s.status === "completed");
    const completionRate =
      sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0;

    setStats({
      thisWeek: thisWeekSessions.length,
      today: todaySessions.length,
      total: sessions.length,
      completionRate,
    });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesSearch =
      search === "" ||
      s.topic?.toLowerCase().includes(search.toLowerCase()) ||
      s.type?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function handleScheduleButton() {
    navigate("/mentor/schedule-session");
  }

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
          <Button
            onClick={() => navigate(`/session/details/${session._id}`)}
            variant="secondary"
          >
            View Details
          </Button>
          <p className="text-sm text-green-400 font-semibold">Completed</p>
        </div>
      );
    }

    if (isOngoing) {
      return (
        <div className="flex flex-col gap-2 mt-3">
          <Button
            onClick={() => navigate(`/session/details/${session._id}`)}
            variant="secondary"
          >
            View Details
          </Button>
          <Button
            onClick={() => navigate(`/session/${session._id}/video`)}
            variant="primary"
          >
            Join Session
          </Button>
        </div>
      );
    }

    // upcoming
    return (
      <div className="flex flex-col gap-2 mt-3">
        <Button
          onClick={() => navigate(`/session/details/${session._id}`)}
          variant="secondary"
        >
          View Details
        </Button>
      </div>
    );
  }

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
            <p className="text-gray-400">Total</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.total}</p>
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
          {filteredSessions.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              No sessions found
            </div>
          ) : (
            filteredSessions.map((session) => (
              <SpokelyCard key={session._id} className="bg-slate-800 text-white">
                <div className="flex justify-between items-center mb-3">
                  <Badge variant={session.status}>
                    {session.startTime
                      ? new Date(session.startTime).toLocaleString()
                      : "No time set"}
                  </Badge>
                  <Badge variant={session.status} size="sm" className="capitalize">
                    {statusLabels[session.status]}
                  </Badge>
                </div>
                <h3 className="font-bold text-black">{session.topic}</h3>
                <p className="text-sm text-black">{session.type}</p>
                {session.description && (
                  <p className="text-sm text-gray-400 mt-2">{session.description}</p>
                )}
                {renderActionButtons(session)}
              </SpokelyCard>
            ))
          )}
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
