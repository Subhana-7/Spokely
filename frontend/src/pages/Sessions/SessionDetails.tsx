import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  DollarSign,
  PlayCircle,
  Star,
} from "lucide-react";
import Button from "../../modals/Button";
import Card from "../../components/common/Cards";
import Badge from "../../components/common/Badge";
import Input from "../../modals/Input";
import { getSessionById, addFeedback } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/userAuthStore";

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; toUserId?: string }>({
    open: false,
  });
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number | "">("");
  const [viewFeedbackModal, setViewFeedbackModal] = useState<{ open: boolean; feedback?: any }>({
    open: false,
  });

  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await getSessionById(id!);
        setSession(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!feedbackComment.trim() || !feedbackRating || !feedbackModal.toUserId) {
      toast.error("Please fill feedback and rating");
      return;
    }
    try {
      const res = await addFeedback(session._id, {
        to: feedbackModal.toUserId,
        comment: feedbackComment,
        rating: Number(feedbackRating),
      });
      setSession(res.data.session);
      toast.success("Feedback submitted successfully!");
      setFeedbackModal({ open: false });
      setFeedbackComment("");
      setFeedbackRating("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit feedback");
    }
  };

  const hasGivenFeedback = (toUserId: string) =>
    session.feedback?.find(
      (f: any) =>
        String(f.from) === String(currentUserId) &&
        String(f.to) === String(toUserId)
    );

  const handleViewFeedback = (toUserId: string) => {
    const feedback = hasGivenFeedback(toUserId);
    if (feedback) setViewFeedbackModal({ open: true, feedback });
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-300 text-lg bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
        Loading session details...
      </div>
    );
  if (!session)
    return (
      <div className="p-6 text-center text-red-500 bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen">
        Session not found.
      </div>
    );

  let participants = session.participants?.map((p: any) => p.user) || [];
  if (session.createdBy && !participants.some((u: any) => u._id === session.createdBy._id)) {
    participants = [session.createdBy, ...participants];
  }

  const statusColors: Record<string, string> = {
    completed: "bg-green-500/20 text-white border border-green-500/30",
    upcoming: "bg-gray-500/20 text-white border border-gray-500/30",
    cancelled: "bg-red-500/20 text-white border border-red-500/30",
    ongoing: "bg-blue-500/20 text-white border border-blue-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24 relative">
      {/* Header */}
      <div className="flex items-center max-w-7xl mx-auto px-6 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors mr-4"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Session Details
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-6">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 hover:shadow-green-500/20 transition-all text-white">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold">{session.topic}</h2>
              <p className="text-gray-400 mt-2">{session.description}</p>
              <div className="flex justify-center gap-3 mt-3">
                <Badge className={statusColors[session.status] || "bg-gray-700 text-white"}>
                  {session.status}
                </Badge>
                <Badge className="bg-blue-500/20 text-white border border-blue-500/30">
                  {session.type}
                </Badge>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="bg-gray-800/60 rounded-xl p-4">
                <Clock className="mx-auto text-yellow-400 mb-2" />
                <p className="text-sm text-gray-400">Start</p>
                <p className="font-semibold">
                  {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <Clock className="mx-auto text-green-400 mb-2" />
                <p className="text-sm text-gray-400">End</p>
                <p className="font-semibold">
                  {session.endTime
                    ? new Date(session.endTime).toLocaleTimeString()
                    : "Not Ended"}
                </p>
              </div>
              <div className="bg-gray-800/60 rounded-xl p-4">
                <Clock className="mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-gray-400">Date</p>
                <p className="font-semibold">
                  {new Date(session.startTime).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/60 p-3 rounded-lg flex items-center gap-2">
                <DollarSign className="text-green-400" /> Fee: ${session.sessionFee || 0}
              </div>
              <div className="bg-gray-800/60 p-3 rounded-lg flex items-center gap-2">
                <Clock className="text-pink-400" /> Duration: {session.durationMinutes || 60} mins
              </div>
            </div>

            {session.recordingLink && (
              <Button
                variant="primary"
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center gap-2"
              >
                <PlayCircle /> Watch Recording
              </Button>
            )}
          </Card>

          {/* Creator */}
          {session.createdBy && (
            <Card
              onClick={() => navigate(`/user/mentor-profile/${session.createdBy._id}`)}
              className="cursor-pointer bg-white/10 border border-white/10 hover:bg-white/20 rounded-2xl p-4 flex items-center gap-3 transition"
            >
              <User className="text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Created By</p>
                <p className="font-semibold text-white">{session.createdBy.name}</p>
              </div>
            </Card>
          )}

          {/* Participants */}
          <Card className="bg-white/10 border border-white/10 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
              <User /> Participants
            </h3>
            {participants.length === 0 ? (
              <p className="text-gray-400">No participants</p>
            ) : (
              participants.map((u: any, i: number) => {
                const existingFeedback = hasGivenFeedback(u._id);
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-white/10 hover:bg-white/5 rounded-md px-2 transition"
                  >
                    <span>{u.name}</span>
                    {session.status === "completed" && u._id !== currentUserId && (
                      <>
                        {existingFeedback ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFeedback(u._id);
                            }}
                            className="text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                          >
                            View Feedback
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFeedbackModal({ open: true, toUserId: u._id });
                            }}
                            className="text-xs bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                          >
                            Give Feedback
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        </div>

        {/* Right Column - Feedback */}
        <div className="space-y-6">
          <Card className="bg-white/10 border border-white/10 rounded-2xl p-6 backdrop-blur-lg text-white">
            <h3 className="text-2xl font-bold mb-4 text-emerald-400">Feedback Received</h3>
            {session.feedback?.length > 0 ? (
              session.feedback
                .filter((f: any) => String(f.to) === String(currentUserId))
                .map((f: any, idx: number) => {
                  const fromUser = participants.find((p: any) => p._id === f.from) || {};
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-gray-800/60 rounded-lg mb-3 border border-gray-700"
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-white">
                          {fromUser.name || "Unknown"}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4" /> {f.rating}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{f.comment}</p>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-400">No feedback yet.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">Give Feedback</h2>
            <Input
              type="text"
              placeholder="Enter feedback..."
              value={feedbackComment}
              onChange={setFeedbackComment}
              className="w-full mb-4 bg-gray-800 text-white border-gray-700"
            />
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  onClick={() => setFeedbackRating(star)}
                  className={`cursor-pointer ${
                    star <= (feedbackRating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-600 hover:text-yellow-400"
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setFeedbackModal({ open: false })}>
                Close
              </Button>
              <Button variant="primary" onClick={handleSubmitFeedback}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Feedback Modal */}
      {viewFeedbackModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">Your Feedback</h2>
            {viewFeedbackModal.feedback && (
              <>
                <div className="flex gap-1 mb-3 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={22}
                      className={
                        star <= viewFeedbackModal.feedback.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-600"
                      }
                    />
                  ))}
                </div>
                <p className="bg-gray-800 text-gray-300 rounded-lg p-3 border border-gray-700">
                  {viewFeedbackModal.feedback.comment}
                </p>
              </>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={() => setViewFeedbackModal({ open: false })}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
