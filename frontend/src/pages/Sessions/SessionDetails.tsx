import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  DollarSign,
  PlayCircle,
  Star,
  CheckCircle,
} from "lucide-react";
import Button from "../../modals/Button";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import { getSessionById } from "../../services/sessionService";
import toast from "react-hot-toast";

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getSessionById(id!);
        console.log(res);
        setSession(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  if (loading)
    return (
      <div className="p-6 text-center text-lg">Loading session details...</div>
    );
  if (!session)
    return (
      <div className="p-6 text-red-600 text-center">Session not found.</div>
    );

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url('/gradient-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for glow effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Header */}
      <div className="relative z-10 px-6 py-4 flex items-center border-b border-white/20 bg-black/30 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Session Details</h1>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 text-center py-12">
        <h2 className="text-4xl font-extrabold drop-shadow-lg">
          {session.topic}
        </h2>
        <p className="text-lg opacity-80 mt-2">{session.description}</p>
        <div className="mt-4 flex justify-center gap-3">
          <Badge
            variant={session.status === "completed" ? "success" : "warning"}
          >
            {session.status}
          </Badge>
          <Badge variant="peer">{session.type}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="backdrop-blur-lg bg-white/10 shadow-xl border border-white/20 hover:shadow-2xl transition">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <Clock className="w-8 h-8 text-yellow-300 mx-auto mb-2" />
                <div className="text-sm opacity-80">Start</div>
                <div className="font-semibold">
                  {new Date(session.startTime).toLocaleTimeString()}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <Clock className="w-8 h-8 text-green-300 mx-auto mb-2" />
                <div className="text-sm opacity-80">End</div>
                <div className="font-semibold">
                  {session.endTime
                    ? new Date(session.endTime).toLocaleTimeString()
                    : "Not ended"}
                </div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <Clock className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <div className="text-sm opacity-80">Date</div>
                <div className="font-semibold">
                  {new Date(session.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                <DollarSign className="text-green-300" /> Fee: $
                {session.sessionFee || 0}
              </div>
              <div className="p-3 rounded-lg bg-white/10 flex items-center gap-2 hover:bg-white/20 transition">
                <Clock className="text-pink-300" /> Duration:{" "}
                {session.durationMinutes || 60} mins
              </div>
            </div>

            {session.recordingLink && (
              <Button
                variant="primary"
                className="w-full mt-6 bg-pink-500 hover:bg-pink-600 flex items-center gap-2"
              >
                <PlayCircle /> Watch Recording
              </Button>
            )}
          </Card>

          {/* Participants */}
          {/* Participants */}
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition">
            <h3 className="font-semibold text-xl mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-300" />
              Participants
            </h3>

            <div className="space-y-3">
              {(() => {
                let participants =
                  session.participants?.map((p: any) => p.user) || [];

                if (session.createdBy) {
                  const alreadyIncluded = participants.some(
                    (u: any) => u._id === session.createdBy._id
                  );
                  if (!alreadyIncluded) {
                    participants = [session.createdBy, ...participants];
                  }
                }

                return participants.length === 0 ? (
                  <p className="text-sm opacity-70">No participants</p>
                ) : (
                  participants.map((u: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => {
                        console.log(u)
                        if (u.role === "mentor") {
                          navigate(`/user/mentor-profile/${u._id}`);
                        } else {
                          navigate(`/user-profile/${u._id}`);
                        }
                      }}
                      className="flex justify-between items-center border-b border-white/20 py-2 hover:bg-white/10 rounded cursor-pointer"
                    >
                      <span>{u.name}</span>
                      <Badge variant="peer" size="sm">
                        {u.level || "Beginner"}
                      </Badge>
                    </div>
                  ))
                );
              })()}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition text-center">
            <h3 className="text-2xl font-bold mb-2">Performance & Feedback</h3>
            <p className="text-sm opacity-80 mb-4">
              AI analysis and mentor feedback after session.
            </p>
            {session.feedback && session.feedback.length > 0 ? (
              <div className="space-y-3 text-left">
                {session.feedback.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold">
                        {f.from?.name || "Anonymous"}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-300">
                        <Star className="w-4 h-4" /> {f.rating || "N/A"}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">{f.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="opacity-70">No feedback yet.</p>
            )}
          </Card>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1">
              Download Report
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle /> Schedule Follow-up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
