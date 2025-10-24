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
import { getSessionById, addFeedback } from "../../services/sessionService";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/userAuthStore";
import Input from "../../modals/Input";

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [feedbackModal, setFeedbackModal] = useState<{
    open: boolean;
    toUserId?: string;
  }>({ open: false });
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackRating, setFeedbackRating] = useState<number | "">("");

  // New state for view feedback modal
  const [viewFeedbackModal, setViewFeedbackModal] = useState<{
    open: boolean;
    feedback?: any;
  }>({ open: false });

  const currentUser = useAuthStore((state) => state.user);
  console.log(currentUser);
  const currentUserId = currentUser?.id;

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

  // Function to check if current user already gave feedback to a specific user
  const hasGivenFeedback = (toUserId: string) => {
    return session.feedback?.find(
      (f: any) =>
        String(f.from) === String(currentUserId) &&
        String(f.to) === String(toUserId)
    );
  };

  // Function to handle view feedback
  const handleViewFeedback = (toUserId: string) => {
    const feedback = hasGivenFeedback(toUserId);
    if (feedback) {
      setViewFeedbackModal({ open: true, feedback });
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-lg">Loading session details...</div>
    );
  if (!session)
    return (
      <div className="p-6 text-red-600 text-center">Session not found.</div>
    );

  let participants = session.participants?.map((p: any) => p.user) || [];
  if (
    session.createdBy &&
    !participants.some((u: any) => u._id === session.createdBy._id)
  ) {
    participants = [session.createdBy, ...participants];
  }

  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url('/gradient-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Session Info Card */}
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
                  {new Date(session.startTime).toLocaleDateString()}
                </div>
              </div>
            </div>

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

          {/* Creator Info */}
          {session.createdBy && (
            <div
              className="cursor-pointer"
              onClick={() =>
                navigate(`/user/mentor-profile/${session.createdBy._id}`)
              }
            >
              <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg hover:shadow-2xl transition">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-300" />
                  <div>
                    <p className="text-sm opacity-80">Session Creator</p>
                    <p className="font-semibold hover:underline">
                      {session.createdBy.name}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Participants */}
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition">
            <h3 className="font-semibold text-xl mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-300" />
              {session.type === "public"
                ? "Participants Count"
                : "Participants"}
            </h3>

            {session.type === "public" ? (
              <p className="text-lg font-bold">
                {session.participants?.length || 0} / 25 joined
              </p>
            ) : (
              <div className="space-y-3">
                {participants.length === 0 ? (
                  <p className="text-sm opacity-70">No participants</p>
                ) : (
                  participants.map((u: any, i: number) => {
                    const existingFeedback = hasGivenFeedback(u._id);

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (u.role === "mentor") {
                            navigate(`/user/mentor-profile/${u._id}`);
                          } else {
                            navigate(`/user-profile/${u._id}`);
                          }
                        }}
                        className="flex justify-between items-center border-b border-white/20 py-2 hover:bg-white/10 rounded cursor-pointer"
                      >
                        <span>{u.name}</span>
                        <div className="flex gap-2">
                          <Badge variant="peer" size="sm">
                            {u.level || "Beginner"}
                          </Badge>
                          {session.status === "completed" &&
                            u._id !== currentUserId && (
                              <>
                                {existingFeedback ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewFeedback(u._id);
                                    }}
                                    className="text-sm bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                                  >
                                    View Feedback
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFeedbackModal({
                                        open: true,
                                        toUserId: u._id,
                                      });
                                    }}
                                    className="text-sm bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                                  >
                                    Give Feedback
                                  </button>
                                )}
                              </>
                            )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Feedback */}
        <div className="space-y-6">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-xl hover:shadow-2xl transition text-center">
            <h3 className="text-2xl font-bold mb-2">Performance & Feedback</h3>
            <p className="text-sm opacity-80 mb-4">Feedback about you:</p>

            {session.feedback?.length > 0 ? (
              session.feedback
                .filter((f: any) => String(f.to) === String(currentUserId))
                .map((f: any, idx: number) => {
                  const fromUser =
                    participants.find((p: any) => p._id === f.from) || {};
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">
                          {fromUser.name || f.from}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-300">
                          <Star className="w-4 h-4" /> {f.rating || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{f.comment}</p>
                    </div>
                  );
                })
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

      {/* Give Feedback Modal */}
{feedbackModal.open && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white text-black rounded-xl p-6 w-96 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Give Feedback</h2>

      <Input
        type="text"
        placeholder="Enter feedback..."
        value={feedbackComment}
        onChange={setFeedbackComment}
        className="w-full mb-4"
      />

      {/* Star Rating Selector */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={28}
            onClick={() => setFeedbackRating(star)}
            className={`cursor-pointer transition-transform ${
              star <= (feedbackRating || 0)
                ? "text-yellow-500 fill-yellow-500 scale-110"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="secondary"
          onClick={() => setFeedbackModal({ open: false })}
        >
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
    <div className="bg-gray-800 text-white rounded-xl p-6 w-96 shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Your Feedback</h2>

      {viewFeedbackModal.feedback && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={22}
                  className={
                    star <= viewFeedbackModal.feedback.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Comment
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-800">
                {viewFeedbackModal.feedback.comment}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button
          variant="secondary"
          onClick={() => setViewFeedbackModal({ open: false })}
        >
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
