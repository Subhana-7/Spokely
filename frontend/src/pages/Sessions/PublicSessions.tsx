import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  IndianRupee,
} from "lucide-react";
import MentorHeader from "../mentor/DashboardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import Button from "../../modals/Button";
import { getPublicSessions } from "../../services/sessionService";
import { startPayment } from "../../services/paymentService";

interface Session {
  _id: string;
  durationMinutes: number;
  sessionFee: number;
  type: string;
  topic: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  createdBy: string;
  participants: string[];
}

const MentorPublicSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; fee: number } | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await getPublicSessions();
        const publicOnly = data.publicSessions.filter(
          (s: Session) => s.type === "public"
        );
        setSessions(publicOnly);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    return (
      matchesSearch &&
      session.status.toLowerCase() === selectedFilter.toLowerCase()
    );
  });

  const handlePayToSchedule = (sessionId: string, sessionFee: number) => {
    if (!sessionFee || sessionFee <= 0) {
      alert("Invalid session fee. Cannot proceed with payment.");
      return;
    }
    setActiveSession({ id: sessionId, fee: sessionFee });
    setShowPayPalModal(true);

    setTimeout(() => {
      startPayment(sessionId, sessionFee);
    }, 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLevelBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "mentor";
      case "completed":
        return "peer";
      default:
        return "public";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MentorHeader />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Public Sessions
          </h1>
          <p className="text-gray-600">
            Discover and join our mentor's upcoming public sessions
          </p>
        </div>

        {/* Search & Filter */}
        <SpokelyCard className="mb-8" padding="md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search sessions by topic or description..."
                value={searchTerm}
                onChange={setSearchTerm}
                rightIcon={<Search size={20} />}
              />
            </div>
            <div className="lg:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </SpokelyCard>

        {/* Sessions */}
        {loading ? (
          <p className="text-center text-gray-600">Loading sessions...</p>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SpokelyCard key={session._id} className="h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="public" size="sm">
                      Public Session
                    </Badge>
                    <Badge
                      variant={getLevelBadgeVariant(session.status)}
                      size="sm"
                    >
                      {session.status}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                    {session.topic}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {session.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar size={16} className="mr-2 text-blue-600" />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock size={16} className="mr-2 text-green-600" />
                      <span>
                        {new Date(session.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({session.durationMinutes} mins)
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users size={16} className="mr-2 text-orange-600" />
                      <span>{session.participants.length} participants</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <IndianRupee size={18} className="text-green-600 mr-1" />
                      <span className="text-2xl font-bold text-gray-900">
                        {session.sessionFee}/-
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Per person</p>
                    </div>
                  </div>
                  <Button
                    variant="success"
                    onClick={() =>
                      handlePayToSchedule(session._id, session.sessionFee)
                    }
                  >
                    Pay to Schedule
                  </Button>
                </div>
              </SpokelyCard>
            ))}
          </div>
        ) : (
          <SpokelyCard variant="secondary" className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No public sessions are currently available"}
              </p>
            </div>
          </SpokelyCard>
        )}
      </div>

      {/* PayPal Modal */}
      {showPayPalModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => setShowPayPalModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Complete Payment</h2>
            <div id="paypal-button-container"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorPublicSessions;
