import { useEffect, useState, type JSX } from "react";
import { Search, Filter, Plus } from "lucide-react";
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
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [cancelModal, setCancelModal] = useState<{ open: boolean; id?: string }>({ open: false });
  const [cancelReason, setCancelReason] = useState<string>("");

 const userId = useAuthStore((state) => state.user?.id!); 
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
    }
    fetchSessions();
  }, [userId]); 

  function handleScheduleButton() {
    navigate("/user/schedule-session");
  }

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      const data = res.data?.sessions || res.data;
      console.log(data)
      setSessions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load sessions");
    }
  };

  const isOngoing = (session: any) => {
    const now = new Date().getTime();
    const start = new Date(session.startTime).getTime();
    const end =
      session.endTime ? new Date(session.endTime).getTime() : start + (session.durationMinutes || 60) * 60 * 1000;
    return now >= start && now <= end;
  };

  const isCompleted = (session: any) => {
    const now = new Date().getTime();
    const start = new Date(session.startTime).getTime();
    const end =
      session.endTime ? new Date(session.endTime).getTime() : start + (session.durationMinutes || 60) * 60 * 1000;
    return now > end;
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim() || !userId) {
      toast.error("Please enter a reason");
      return;
    }
    try {
      console.log(cancelModal.id)
      await cancelSession(userId,cancelModal.id as string, cancelReason);
      toast.success("Session cancelled");
      setCancelModal({ open: false });
      setCancelReason("");
      fetchSessions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel session");
    }
  };

  const renderStatus = (session: any) => {
    const now = new Date().getTime();
    const start = new Date(session.startTime).getTime();
    const end =
      session.endTime ? new Date(session.endTime).getTime() : start + (session.durationMinutes || 60) * 60 * 1000;

    if (session.status === "cancelled") return "cancelled";

    // Automatically mark past sessions as completed
    if (session.status !== "cancelled") {
      if (now > end) {
        session.status = "completed";
        return "completed";
      }
    }

    if (now >= start && now <= end) return "on-going";
    return "upcoming";
  };

  const renderActionButtons = (session: any) => {
    const status = renderStatus(session);

    if (status === "cancelled") {
      return <p className="text-sm text-red-400">This session was cancelled</p>;
    }

    if (status === "completed") {
      return (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => navigate(`/user/session/details/${session._id}`)}
            variant="secondary"
          >
            View Details
          </Button>
          <p className="text-sm text-green-400 font-semibold">Completed</p>
        </div>
      );
    }

    if (status === "on-going") {
      return (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => navigate(`/user/session/details/${session._id}`)}
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
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => navigate(`/user/session/details/${session._id}`)}
          variant="secondary"
        >
          View Details
        </Button>
        <Button
          variant="danger"
          onClick={() => setCancelModal({ open: true, id: session._id })}
        >
          Cancel Session
        </Button>
      </div>
    );
  };

  // helper: check if session date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  // split and sort sessions
  const todaySessions = sessions
    .filter((s) => isToday(s.startTime))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const otherSessions = sessions
    .filter((s) => !isToday(s.startTime))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{ backgroundImage: `url('/gradient-bg.jpg')` }}
    >
      <DashboardHeader />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Sessions</h1>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search by topic or type..."
                className="pl-10 h-12 bg-gray border-gray-300 text-black"
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

        {/* Today’s Upcoming Sessions */}
        {todaySessions.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Upcoming (Today)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {todaySessions.map((session) => (
                <Card key={session._id} className="bg-white/10 border shadow-lg relative">
                  <div className="absolute top-4 right-4">
                    <Badge variant={renderStatus(session)}>{renderStatus(session)}</Badge>
                  </div>
                  <h3 className="font-bold">{session.topic}</h3>
                  <p className="text-sm">{session.type}</p>
                  <p className="text-xs text-gray-300">{new Date(session.startTime).toLocaleString()}</p>
                  {renderActionButtons(session)}
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Other Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherSessions.map((session) => (
                <Card key={session._id} className="bg-white/10 border shadow-lg relative">
                  <div className="absolute top-4 right-4">
                    <Badge variant={renderStatus(session)}>{renderStatus(session)}</Badge>
                  </div>
                  <h3 className="font-bold">{session.topic}</h3>
                  <p className="text-sm">{session.type}</p>
                  <p className="text-xs text-gray-300">{new Date(session.startTime).toLocaleString()}</p>
                  {renderActionButtons(session)}
                </Card>
              ))}
            </div>
          </>
        )}
      </main>

      <button
        onClick={handleScheduleButton}
        className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        <Plus size={24} />
      </button>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Cancel Session</h2>
            <Input
              type="text"
              placeholder="Enter reason..."
              value={cancelReason}
              onChange={setCancelReason}
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setCancelModal({ open: false })}>
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
