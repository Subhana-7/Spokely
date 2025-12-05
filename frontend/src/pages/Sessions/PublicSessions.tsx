import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { PayPalNamespace } from "@paypal/paypal-js";
import DashboardHeader from "../user/DashBoardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import Button from "../../modals/Button";
import { getPublicSessions } from "../../services/sessionService";
import { startPayment, confirmPayment } from "../../services/paymentService";
import { useAuthStore } from "../../store/userAuthStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

declare global {
  interface Window {
    paypal?: PayPalNamespace | null;
  }
}

interface Participant {
  user: string;
  status: string;
}

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
  createdBy: any;
  participants: Participant[];
}

const MentorPublicSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    id: string;
    fee: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data } = await getPublicSessions({
          search: debouncedSearch,
          status: selectedFilter,
          page,
          limit,
        });
        const now = new Date();
        const FIFTEEN_MIN = 15 * 60 * 1000;

        const filtered = (data.sessions || []).filter((session: any) => {
          const start = new Date(session.startTime).getTime();
          return start - now.getTime() >= FIFTEEN_MIN;
        });

        setSessions(filtered);

        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        toast.error("Failed to fetch public sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [debouncedSearch, selectedFilter, page]);

  const handlePayToSchedule = (sessionId: string, sessionFee: number) => {
    if (!sessionFee || sessionFee <= 0)
      return toast.error("Invalid session fee");
    setActiveSession({ id: sessionId, fee: sessionFee });
    setShowPayPalModal(true);
  };

  useEffect(() => {
    if (!showPayPalModal || !activeSession) return;
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    const loadPaypalButtons = async () => {
      try {
        const paypalNamespace = await import("@paypal/paypal-js");
        const paypal = await paypalNamespace.loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: "USD",
        });

        const buttons = paypal?.Buttons?.({
          createOrder: async () => {
            const resp = await startPayment(
              activeSession.id,
              activeSession.fee
            );

            const orderId = resp.data?.id;
            if (!orderId)
              throw new Error("Order ID missing from PayPal response");

            return orderId;
          },
          onApprove: async (data: any) => {
            try {
              setIsProcessing(true);
              const verify = await confirmPayment(
                data.orderID,
                activeSession.id
              );
              if (
                verify.data?.status === "COMPLETED" ||
                verify.data?.message?.toLowerCase()?.includes("captured")
              ) {
                toast.success("Payment successful!");
                setSessions((prev) =>
                  prev.map((s) =>
                    s._id === activeSession.id
                      ? {
                          ...s,
                          participants: [
                            ...s.participants,
                            { user: user?.id || "", status: "accepted" },
                          ],
                        }
                      : s
                  )
                );
              } else toast.error("Payment verification failed");
            } catch {
              toast.error("Payment failed");
            } finally {
              setIsProcessing(false);
              setShowPayPalModal(false);
            }
          },
          onCancel: () => {
            setShowPayPalModal(false);
            toast("Payment cancelled");
          },
          onError: () => {
            setShowPayPalModal(false);
            toast.error("PayPal error occurred");
          },
        });
        buttons?.render("#paypal-button-container");
      } catch {
        toast.error("PayPal failed to load");
      }
    };

    loadPaypalButtons();
  }, [showPayPalModal, activeSession, user?.id]);

  const formatDateTime = (start: string) =>
    new Date(start).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const badgeColors = {
    upcoming: "bg-gray-500/20 text-gray-300 border border-gray-600",
    completed: "bg-green-500/20 text-green-300 border border-green-600",
    public: "bg-emerald-500/20 text-emerald-300 border border-emerald-600",
    accepted: "bg-blue-500/20 text-blue-300 border border-blue-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
            Public Sessions
          </h2>
          <Button
            variant="primary"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg"
            onClick={() => navigate("/user/session")}
          >
            Back to My Sessions
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search by topic or description..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-12 pr-4 py-3 text-sm border border-gray-700 rounded-full bg-gray-800 text-white placeholder-gray-400 shadow-md"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Session Cards */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No public sessions found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => {
                const totalParticipants = session.participants.length + 1;
                const isFull = totalParticipants >= 24;

                const isJoined = session.participants.some(
                  (p) => p.user === user?.id
                );
                const badgeStyle =
                  badgeColors[
                    session.status.toLowerCase() as keyof typeof badgeColors
                  ] || badgeColors.public;

                return (
                  <SpokelyCard
                    key={session._id}
                    className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl shadow-lg p-6 hover:shadow-green-500/20 transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg truncate text-white">
                        {session.topic}
                      </h3>
                      <Badge className={badgeStyle}>{session.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">
                      {formatDateTime(session.startTime)}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Fee: ₹{session.sessionFee} | Mentor:{" "}
                      {session.createdBy?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-300 mb-2">
                      Participants: {session.participants.length + 1} / 24
                    </p>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(`/session/details/${session._id}`)
                        }
                      >
                        View Details
                      </Button>
                      {isJoined ? (
                        <Button variant="secondary" disabled>
                          Joined
                        </Button>
                      ) : isFull ? (
                        <Button variant="secondary" disabled>
                          Session Full (24/24)
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          onClick={() =>
                            handlePayToSchedule(session._id, session.sessionFee)
                          }
                        >
                          Pay & Join
                        </Button>
                      )}
                    </div>
                  </SpokelyCard>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={18} /> Prev
                </Button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
                >
                  Next <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* PayPal Modal */}
      {showPayPalModal && activeSession && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 text-white rounded-2xl p-6 w-96 shadow-2xl">
            <h2 className="text-lg font-semibold mb-4 text-emerald-400">
              Complete Payment
            </h2>
            <div id="paypal-button-container" />
            {isProcessing && (
              <div className="mt-4 text-sm text-gray-400 text-center">
                Processing payment...
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowPayPalModal(false)}
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

export default MentorPublicSessions;
