import { useEffect, useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import DashboardHeader from "../user/DashBoardComponents.jsx/Header";
import { getSessions } from "../../services/sessionService";
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

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const navigate = useNavigate();

  function handleScheduleButton() {
    try {
      navigate("/user/schedule-session");
    } catch (error) {
      console.log("error navigating schedule button", error);
    }
  }

  useEffect(() => {
    const userId = localStorage.getItem("userId") || "";
    setCurrentUserId(userId);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res.data?.sessions || res.data;
      console.log(data);
      if (Array.isArray(data)) {
        setSessions(data as Session[]);
      } else {
        console.warn("Unexpected session data:", data);
        setSessions([]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (session) =>
      session.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSessionCreator = (session: Session) =>
    session.createdBy?._id === currentUserId || session.createdBy === currentUserId;

  const isSessionParticipant = (session: Session) =>
    session.participants?.some(
      (p) => p._id === currentUserId || p === currentUserId
    ) ||
    session.mentorId?._id === currentUserId ||
    session.mentorId === currentUserId;

  const canJoinSession = (session: Session) => {
    if (!session.startTime) return false;
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(
      session.endTime ||
        new Date(
          startTime.getTime() + (session.durationMinutes || 60) * 60000
        )
    );
    return (
      (session.status === "accepted" || session.status === "upcoming") &&
      now >= startTime &&
      now <= endTime
    );
  };

  const renderActionButtons = (session: Session) => {
    if (session.status === "pending") {
      return (
        <p className="text-sm text-yellow-600 text-center">
          Waiting for approval...
        </p>
      );
    }

    if (session.status === "cancelled") {
      return (
        <p className="text-sm text-red-500 text-center">
          This session has been cancelled
        </p>
      );
    }

    if (session.status === "completed") {
      return (
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => navigate(`/session/${session._id}/video`)}
          >
            View Session
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              navigate(`/user/session/details/${session._id}`)
            }
          >
            View Details
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => navigate(`/session/${session._id}/video`)}
          disabled={!canJoinSession(session)}
        >
          {canJoinSession(session) ? "Join Session" : "Not Started"}
        </Button>
        <Button variant="secondary" className="flex-1">
          Reschedule
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
                value={searchTerm}
                onChange={setSearchTerm}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 text-center col-span-full">
              No sessions found.
            </p>
          ) : (
            filteredSessions.map((session) => (
              <Card key={session._id} className="relative">
                <div className="absolute top-4 right-4">
                  <Badge variant={session.status}>
                    {statusLabels[session.status] ||
                      session.status?.toUpperCase()}
                  </Badge>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-green-600 font-medium mb-2">
                    {session.startTime
                      ? new Date(session.startTime).toLocaleString()
                      : "No time set"}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {session.topic}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{session.type}</p>
                  <p className="text-gray-700 mb-4">{session.description}</p>
                </div>
                {renderActionButtons(session)}
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mt-3">
                  <p className="text-xs text-green-800">
                    <strong>Members:</strong> {session.participants?.length || 0}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
      <button
        onClick={handleScheduleButton}
        className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default Sessions;
