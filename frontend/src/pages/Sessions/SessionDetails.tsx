import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
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
        console.log(res.data);
        setSession(res.data);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) return <div className="p-6">Loading session details...</div>;
  if (!session)
    return <div className="p-6 text-red-600">Session not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Session Details</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {session.topic}
                </h2>
                <Badge
                  variant={
                    session.type === "peer-to-peer"
                      ? "peer"
                      : session.type.includes("mentor")
                      ? "mentor"
                      : "private"
                  }
                >
                  {session.type}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-lime-50 rounded-lg">
                  <Clock className="w-8 h-8 text-lime-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Start</div>
                  <div className="font-semibold text-gray-900">
                    {session.startTime}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">End</div>
                  <div className="font-semibold text-gray-900">
                    {session.endTime}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-lime-600" />
                  Topic
                </h3>
                <div className="bg-lime-100 text-lime-800 px-3 py-2 rounded-lg font-medium">
                  {session.topic}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {session.description}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-lime-600" />
                Participants
              </h3>
              <div className="space-y-2">
                {!session.participants || session.participants.length === 0 ? (
                  <p className="text-gray-500 text-sm">No participants</p>
                ) : (
                  session.participants.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b py-2"
                    >
                      <span className="text-gray-800">{m.name}</span>
                      <Badge variant="peer" size="sm">
                        {m.level || "Beginner"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="info">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Performance & Feedback
                </h3>
                <p className="text-sm text-gray-600">
                  AI analysis and mentor feedback will be available after the
                  session.
                </p>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1">
                Download Report
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-lime-500 hover:bg-lime-600"
              >
                Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
