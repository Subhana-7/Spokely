import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminSessionDetails } from "../../services/sessionService";

interface Participant {
  id: string;
  name: string;
  email?: string;
  status: string;
}

interface Feedback {
  toName: string;
  fromName: string;
  from: string;
  comment: string;
  rating?: number;
}

interface Flag {
  reason: string;
  flaggedBy: string;
}

interface SessionDetails {
  createdBy: any;
  topic: string;
  description: string;
  type: string;
  status: string;
  mentor: { name: string; email: string };
  startTime: string;
  endTime?: string;
  participants: Participant[];
  feedback: Feedback[];
  flags: Flag[];
}

const AdminSessionDetailsPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState<SessionDetails | null>(null);

  const fetchSession = async () => {
    try {
      const { data } = await adminSessionDetails(id as string);

      // Map participants
      const participants: Participant[] = data.session.participants.map((p: any) => ({
        name: p.user?.name,
        email: p.user?.email,
        status: p.status,
        id: p.user?._id, // keep ID for feedback mapping
      }));

      // Add createdBy as first participant
      if (data.session.createdBy) {
        participants.unshift({
          name: data.session.createdBy.name,
          email: data.session.createdBy.email,
          status: "creator",
          id: data.session.createdBy._id, // keep ID
        });
      }

      // Create a lookup map for userId → name
      const userMap: Record<string, string> = {};
      participants.forEach((p) => {
        if ((p as any).id) userMap[(p as any).id] = p.name;
      });

      // Map feedback to include fromName and toName
      const feedback = (data.session.feedback || []).map((f: any) => ({
        ...f,
        fromName: userMap[f.from] || f.from,
        toName: userMap[f.to] || f.to,
      }));

      const mappedSession: SessionDetails = {
        ...data.session,
        participants,
        feedback,
      };

      setSession(mappedSession);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "cancelled":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "creator":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  console.log('session', session);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900">{session.topic}</h1>
              <div className="flex items-center space-x-3">
                <span className={getStatusBadge(session.status)}>{session.status}</span>
                <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">
                  {session.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 leading-relaxed">
                {session.description || "No description provided"}
              </p>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Participants ({session.participants.length})
              </h2>
              <div className="space-y-3">
                {session.participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {participant.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{participant.name}</p>
                        {participant.email && (
                          <p className="text-sm text-slate-500">{participant.email}</p>
                        )}
                      </div>
                    </div>
                    <span className={getStatusBadge(participant.status)}>
                      {participant.status === "creator" ? "Creator" : participant.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Feedback ({session.feedback.length})
              </h2>
              {session.feedback.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-400 text-4xl mb-4">💬</div>
                  <p className="text-slate-500">No feedback has been submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {session.feedback.map((feedback, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-900">{feedback.fromName}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-medium text-slate-900">{feedback.toName}</span>
                        </div>
                        {feedback.rating && (
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400 text-sm">
                              {getRatingStars(feedback.rating)}
                            </span>
                            <span className="text-sm text-slate-500">({feedback.rating}/5)</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Session Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Started</p>
                    <p className="text-sm text-slate-500">
                      {new Date(session.startTime).toLocaleDateString()} at{" "}
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                {session.endTime && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Ended</p>
                      <p className="text-sm text-slate-500">
                        {new Date(session.endTime).toLocaleDateString()} at{" "}
                        {new Date(session.endTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mentor Info */}
            {session.mentor && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Mentor</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {session.mentor.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{session.mentor.name}</p>
                    <p className="text-sm text-slate-500">{session.mentor.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Flags */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Flags ({session.flags.length})
              </h3>
              {session.flags.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-slate-400 text-3xl mb-2">✓</div>
                  <p className="text-sm text-slate-500">No flags reported</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {session.flags.map((flag, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm font-medium text-red-900 mb-1">{flag.reason}</p>
                      <p className="text-xs text-red-600">Flagged by {flag.flaggedBy}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSessionDetailsPage;