import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Badge from "../../components/common/Badge";
import SpokelyCard from "../../components/common/Cards";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Toggle from "../../modals/Toggle";
import MentorHeader from "../mentor/DashboardComponents/Header";
import { getSessions, updateSession } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type SessionStatus =
  | "pending"
  | "upcoming" 
  | "accepted"
  | "completed"
  | "cancelled";

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
    completionRate: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '';
    setCurrentUserId(userId);
  }, []);

  const handleAcceptSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { status: 'accepted' });
      toast.success("Session accepted successfully!");
      fetchSessions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to accept session");
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { status: 'cancelled' });
      toast.success("Session cancelled successfully!");
      fetchSessions();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to cancel session");
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res.data?.sessions || res.data;

      console.log(data)

      if (Array.isArray(data)) {
        setSessions(data as Session[]);
        calculateStats(data as Session[]);
      } else {
        console.warn("Unexpected session data:", data);
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

    const todaySessions = sessions.filter(session => {
      if (!session.startTime) return false;
      const sessionDate = new Date(session.startTime);
      return sessionDate >= today && sessionDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const thisWeekSessions = sessions.filter(session => {
      if (!session.startTime) return false;
      const sessionDate = new Date(session.startTime);
      return sessionDate >= weekStart && sessionDate <= now;
    });

    const completedSessions = sessions.filter(session => session.status === 'completed');
    const completionRate = sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0;

    setStats({
      thisWeek: thisWeekSessions.length,
      today: todaySessions.length,
      total: sessions.length,
      completionRate
    });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (session) => {
      const matchesFilter = filter === "all" || session.status === filter;
      const matchesSearch = search === "" ||
        session.topic?.toLowerCase().includes(search.toLowerCase()) ||
        session.type?.toLowerCase().includes(search.toLowerCase()) ||
        session.participants?.some(p => 
          (typeof p === 'string' ? p : p.name || p.username)?.toLowerCase().includes(search.toLowerCase())
        );
      
      return matchesFilter && matchesSearch;
    }
  );

  const isSessionCreator = (session: Session) => {
    return session.createdBy?._id === currentUserId || session.createdBy === currentUserId;
  };

  const isSessionMentor = (session: Session) => {
    return session.mentorId?._id === currentUserId || session.mentorId === currentUserId;
  };

  const canJoinSession = (session: Session) => {
    if (!session.startTime) return false;
    
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(
      session.endTime || 
      new Date(startTime.getTime() + (session.durationMinutes || 60) * 60000)
    );

    return (
      (session.status === 'accepted' || session.status === 'upcoming') &&
      now >= startTime &&
      now <= endTime
    );
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date >= today) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' }) + 
             ` ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getParticipantsText = (session: Session) => {
    if (!session.participants || session.participants.length === 0) {
      return "No participants";
    }
    
    return session.participants.map(p => 
      typeof p === 'string' ? p : (p.name || p.username || 'Unknown')
    ).join(', ');
  };

  const renderActionButtons = (session: Session) => {
    const isMentor = isSessionMentor(session);
    const isCreator = isSessionCreator(session);

    if (session.status === 'pending') {
      if (isMentor && !isCreator) {
        return (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button 
              variant="success"
              onClick={() => handleAcceptSession(session._id)}
            >
              Accept
            </Button>
            <Button 
              variant="warning"
              onClick={() => handleRejectSession(session._id)}
            >
              Reject
            </Button>
          </div>
        );
      } else {
        return (
          <div className="mt-4">
            <p className="text-sm text-amber-600 text-center">
              Waiting for approval...
            </p>
          </div>
        );
      }
    }

    if (session.status === 'upcoming' || session.status === 'accepted') {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="success"
            onClick={() => navigate(`/session/${session._id}/video`)}
            disabled={!canJoinSession(session)}
          >
            {canJoinSession(session) ? "Join Session" : "Not Started"}
          </Button>
          <Button 
            variant="warning"
            onClick={() => {/* Handle reschedule */}}
          >
            Reschedule
          </Button>
        </div>
      );
    }

    if (session.status === 'completed') {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="primary"
            onClick={() => navigate(`/mentor/session/details/${session._id}`)}
          >
            View Details
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {/* Handle notes */}}
          >
            Notes
          </Button>
        </div>
      );
    }

    if (session.status === 'cancelled') {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button 
            variant="warning"
            onClick={() => {/* Handle reschedule */}}
          >
            Reschedule
          </Button>
          <Button 
            variant="secondary"
            onClick={() => {/* Handle contact */}}
          >
            Contact
          </Button>
        </div>
      );
    }

    return null;
  };

  function handleScheduleButton() {
    try {
      navigate("/mentor/schedule-session");
    } catch (error) {
      console.log("error navigating schedule button", error);
    }
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      <div className="mb-8">
        <MentorHeader />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-emerald-700 tracking-tight">
            Sessions Hub
          </h1>
          <p className="text-gray-500 text-base">
            Manage all your sessions in one place
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
        <div className="text-center">
          <p className="text-gray-500">This Week</p>
          <p className="text-2xl font-bold">{stats.thisWeek}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Today</p>
          <p className="text-2xl font-bold">{stats.today}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Completion Rate</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Toggle
          options={[
            { value: "all", label: "All Sessions" },
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
            placeholder="Search by topic, type, or student"
            value={search}
            onChange={(val) => setSearch(val)}
            rightIcon={<Search size={18} />}
          />
        </div>
      </div>

      {/* Session Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredSessions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No sessions found.</p>
            <p className="text-gray-400 text-sm mt-2">
              {sessions.length === 0 
                ? "You haven't created or been assigned any sessions yet."
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SpokelyCard key={session._id}>
              <div className="flex justify-between items-center mb-3">
                <Badge variant={session.status}>
                  {session.startTime ? formatDateTime(session.startTime) : "No time set"}
                </Badge>
                <Badge variant={session.status} size="sm" className="capitalize">
                  {statusLabels[session.status] || session.status}
                </Badge>
              </div>
              
              <h3 className="font-bold">
                {session.topic}{" "}
                <span className="text-gray-500">· {session.type}</span>
              </h3>
              
              <p className="font-medium text-sm text-gray-700">
                Participants: {getParticipantsText(session)}
              </p>
              
              {session.description && (
                <p className="text-sm text-gray-600 mt-2">{session.description}</p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                <p className="text-xs text-amber-800">
                  <strong>Fee:</strong> ₹{session.sessionFee || 0} /-
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-3">
                <p className="text-xs text-amber-800">
                  <strong>Duration:</strong> {session.durationMinutes || 60} minutes
                </p>
              </div>

              {renderActionButtons(session)}
            </SpokelyCard>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleScheduleButton}
        className="fixed bottom-8 right-8 bg-lime-500 hover:bg-lime-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default SessionsHub;