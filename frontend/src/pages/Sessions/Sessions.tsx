import { useEffect, useState, type JSX } from "react";
import { Search, Filter, Plus, Flag } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import DashboardHeader from "../user/DashBoardComponents/Header";
import {
  getSessions,
  respondToInvite,
  cancelParticipation,
  cancelSession,
  flagSession,
} from "../../services/sessionService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Sessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    setCurrentUserId(userId);
    fetchSessions();
  }, []);

  function handleScheduleButton() {
    navigate("/user/schedule-session");
  }

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res.data?.sessions || res.data;
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    }
  };

  // check if user can respond (before 15 mins of start)
  const canRespond = (session: any) => {
    if (!session.startTime) return false;
    const start = new Date(session.startTime).getTime();
    const cutoff = start - 15 * 60 * 1000; // 15 mins before start
    return Date.now() < cutoff;
  };

  // check if session is live now
  const isOngoing = (session: any) => {
    const now = new Date().getTime();
    const start = new Date(session.startTime).getTime();
    const end =
      session.endTime ||
      start + (session.durationMinutes || 60) * 60 * 1000;
    return now >= start && now <= end;
  };

  const handleRespond = async (id: string, status: "accepted" | "rejected") => {
    try {
      await respondToInvite(id, status);
      toast.success(`Session ${status}`);
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to respond");
    }
  };

  const handleCancelParticipation = async (id: string) => {
    const reason = prompt("Enter reason for cancellation:");
    if (!reason) return;
    try {
      await cancelParticipation(id, reason);
      toast.success("Participation cancelled");
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    }
  };

  const handleCancelSession = async (id: string) => {
    const reason = prompt("Enter reason to cancel session:");
    if (!reason) return;
    try {
      await cancelSession(id, reason);
      toast.success("Session cancelled");
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel session");
    }
  };

  const handleFlag = async (id: string, participants: any[]) => {
    const reason = prompt("Enter reason to flag this session:");
    if (!reason) return;

    let againstUser = "";
    if (participants.length > 0) {
      againstUser =
        prompt(
          "Enter participantId to flag (or leave blank for none):"
        ) || "";
    }

    try {
      await flagSession(id, reason, againstUser);
      toast.success("Session flagged");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to flag session");
    }
  };

const renderActionButtons = (session: any) => {
  const extraActions: JSX.Element | null = (() => {
    // PENDING → Accept/Reject
    if (session.status === "pending") {
      if (session.createdBy === currentUserId) {
        return <p className="text-sm text-yellow-400">Waiting for response</p>;
      }
      return canRespond(session) ? (
        <div className="flex gap-2">
          <Button
            onClick={() => handleRespond(session._id, "accepted")}
            variant="success"
          >
            Accept
          </Button>
          <Button
            onClick={() => handleRespond(session._id, "rejected")}
            variant="danger"
          >
            Reject
          </Button>
        </div>
      ) : (
        <p className="text-sm text-yellow-400">Too late to respond</p>
      );
    }

    // REJECTED / CANCELLED
    if (session.status === "cancelled" || session.status === "rejected") {
      return <p className="text-sm text-red-400">This session was cancelled</p>;
    }

    // UPCOMING / ACCEPTED
    if (session.status === "upcoming" || session.status === "accepted") {
      if (isOngoing(session)) {
        return (
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => navigate(`/session/${session._id}/video`)}
              variant="primary"
            >
              Video Call
            </Button>
            <Button
              variant="danger"
              onClick={() => handleCancelParticipation(session._id)}
            >
              Leave Session
            </Button>
          </div>
        );
      }
      return (
        <Button
          variant="danger"
          onClick={() => handleCancelParticipation(session._id)}
        >
          Cancel
        </Button>
      );
    }

    // COMPLETED
    if (session.status === "completed") {
      return (
        <Button
          variant="outline"
          onClick={() => handleFlag(session._id, session.participants || [])}
        >
          <Flag size={16} /> Flag
        </Button>
      );
    }

    return null;
  })();

  return (
    <div className="flex flex-col gap-2">
      {/* Always show details button */}
      <Button
        onClick={() => navigate(`/user/session/details/${session._id}`)}
        variant="secondary"
      >
        View Details
      </Button>
      {extraActions}
    </div>
  );
};


  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{ backgroundImage: `url('/gradient-bg.jpg')` }}
    >
      <DashboardHeader />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">


        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Sessions</h1>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by topic or type..."
                // value={searchTerm}
                // onChange={setSearchTerm}
                className="pl-10 h-12 bg-white border-gray-300"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-green-50 transition-colors">
                <Filter size={16} />
                All
              </button>
              <Button
                onClick={() => navigate("/user/sessions/public")}
                variant="success"
              >
                Public Sessions
              </Button>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card
              key={session._id}
              className="bg-white/10 border shadow-lg relative"
            >
              <div className="absolute top-4 right-4">
                <Badge variant={session.status}>{session.status}</Badge>
              </div>
              <h3 className="font-bold">{session.topic}</h3>
              <p className="text-sm">{session.type}</p>
              <p className="text-xs text-gray-300">
                {new Date(session.startTime).toLocaleString()}
              </p>
              {renderActionButtons(session)}
            </Card>
          ))}
        </div>
      </main>

      <button
        onClick={handleScheduleButton}
        className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Sessions;
