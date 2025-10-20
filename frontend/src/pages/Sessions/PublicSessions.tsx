import React, { useEffect, useState } from "react";
import { Calendar, Search, IndianRupee, DollarSign } from "lucide-react";
import type { PayPalNamespace } from "@paypal/paypal-js";
import Header from "../user/DashBoardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import Button from "../../modals/Button";
import { getPublicSessions } from "../../services/sessionService";
import { startPayment, confirmPayment } from "../../services/paymentService";
import { useAuthStore } from "../../store/userAuthStore";
import { useNavigate } from "react-router-dom";

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
  createdBy: string;
  participants: Participant[];
}

interface PaymentResponse {
  orderId?: string;
  id?: string;
  message?: string;
  success?: boolean;
  data?: {
    orderId?: string;
  };
}

const MentorPublicSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const navigate = useNavigate();

  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    id: string;
    fee: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentResult, setPaymentResult] = useState<{
    status: "success" | "error";
    message: string;
  } | null>(null);

  const { user } = useAuthStore();

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

  console.log(sessions);

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

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const now = new Date();
  const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60000);

  const todayUpcoming = filteredSessions
    .filter(
      (s) =>
        isToday(s.startTime) &&
        new Date(s.startTime) >= fifteenMinsFromNow &&
        s.status.toLowerCase() !== "completed" &&
        s.status.toLowerCase() !== "cancelled"
    )
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  const otherSessions = filteredSessions
    .filter(
      (s) =>
        !(
          isToday(s.startTime) &&
          new Date(s.startTime) >= fifteenMinsFromNow &&
          s.status.toLowerCase() !== "completed" &&
          s.status.toLowerCase() !== "cancelled"
        )
    )
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

  const handlePayToSchedule = (sessionId: string, sessionFee: number) => {
    if (!sessionFee || sessionFee <= 0) {
      setPaymentResult({
        status: "error",
        message: "Invalid session fee. Cannot proceed with payment.",
      });
      return;
    }

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

        if (!paypal?.Buttons) {
          setPaymentResult({
            status: "error",
            message: "PayPal failed to load",
          });
          setShowPayPalModal(false);
          return;
        }

        const buttons = paypal.Buttons({
          createOrder: async () => {
            try {
              const resp = await startPayment(
                activeSession.id,
                activeSession.fee
              );
              console.log("Payment response:", resp);

              return resp.data?.id;
            } catch (err: any) {
              console.error("createOrder error:", err);
              setShowPayPalModal(false);
              setPaymentResult({
                status: "error",
                message: err?.message || "Failed to create order.",
              });
              throw err;
            }
          },

          onApprove: async (data: any) => {
            try {
              setIsProcessing(true);
              const orderId = data.orderID;
              const verify = await confirmPayment(orderId, activeSession.id);

              console.log("Verify response:", verify);

              if (
                verify.data?.status === "COMPLETED" ||
                verify.data?.message
                  ?.toLowerCase()
                  .includes("captured successfully")
              ) {
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

                setPaymentResult({
                  status: "success",
                  message:
                    verify.data?.message ||
                    "Payment successful! Session scheduled 🎉",
                });
              } else {
                setPaymentResult({
                  status: "error",
                  message:
                    verify.data?.message || "Payment verification failed.",
                });
              }
            } catch (err: any) {
              console.error("onApprove error:", err);
              setPaymentResult({
                status: "error",
                message: err?.message || "Payment failed.",
              });
            } finally {
              setIsProcessing(false);
              setShowPayPalModal(false);
            }
          },

          onCancel: () => {
            setShowPayPalModal(false);
            setPaymentResult({
              status: "error",
              message: "Payment cancelled.",
            });
          },
          onError: (err: any) => {
            console.error("PayPal error:", err);
            setShowPayPalModal(false);
            setPaymentResult({
              status: "error",
              message: "Payment error. Please try again.",
            });
          },
        });

        buttons.render("#paypal-button-container");
      } catch (err) {
        console.error("PayPal script load error:", err);
        container.innerText = "PayPal failed to load";
      }
    };

    loadPaypalButtons();
  }, [showPayPalModal, activeSession, user?.id]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getLevelBadgeVariant = (
    status: string
  ):
    | "accepted"
    | "mentor"
    | "peer"
    | "public"
    | "upcoming"
    | "completed"
    | "private"
    | "pending"
    | "cancelled" => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "upcoming";
      case "completed":
        return "completed";
      case "scheduled":
        return "accepted";
      default:
        return "public";
    }
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{ backgroundImage: `url('/gradient-bg.jpg')` }}
    >
      <Header />
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Public Sessions
          </h1>
          <p className="text-gray-300">
            Discover and join our mentor's upcoming public sessions
          </p>
        </div>

        {/* Search & Filter */}
        <SpokelyCard className="mb-8 bg-white/10 border shadow-lg" padding="md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search sessions by topic..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10 h-12 bg-gray border-gray-300 text-white"
              />
            </div>
            <div className="lg:w-48">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all" className="border-gray-300 text-black bg-gray" >All Status</option>
                <option value="upcoming" className="border-gray-300 text-black bg-gray">Upcoming</option>
                <option value="completed" className="border-gray-300 text-black bg-gray">Completed</option>
                {/* <option value="scheduled" className="border-gray-300 text-black bg-gray">Scheduled</option> */}
              </select>
            </div>
          </div>
        </SpokelyCard>

        {/* 🟢 Upcoming Today Section */}
        {todayUpcoming.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Upcoming (Today)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {todayUpcoming.map((session) => {
                const isScheduled = session.participants.some(
                  (p) => p.user === user?.id
                );

                return (
                  <SpokelyCard
                    key={session._id}
                    className="bg-white/10 border shadow-lg relative flex flex-col"
                  >
                    <div className="absolute top-4 right-4">
                      <Badge variant={getLevelBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white">{session.topic}</h3>
                    {/* <p className="text-sm text-gray-200">
                      {session.description}
                    </p> */}
                    <p className="text-xs text-gray-300">
                      {formatDate(session.startTime)} –{" "}
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={18} className="text-green-400" />
                        <span className="text-lg font-bold">
                          {session.sessionFee}/-
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 m-5">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/session/details/${session._id}`)
                          }
                        >
                          View Details
                        </Button>

                        {isScheduled ? (
                          <Button variant="secondary" disabled>
                            Scheduled
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() =>
                              handlePayToSchedule(
                                session._id,
                                session.sessionFee
                              )
                            }
                          >
                            Pay to Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </SpokelyCard>
                );
              })}
            </div>
          </>
        )}

        {/* 🟢 Other Sessions Section */}
        {otherSessions.length > 0 ? (
          <>
            <h2 className="text-2xl font-semibold mb-4">Other Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherSessions.map((session) => {
                const isScheduled = session.participants.some(
                  (p) => p.user === user?.id
                );

                return (
                  <SpokelyCard
                    key={session._id}
                    className="bg-white/10 border shadow-lg relative flex flex-col"
                  >
                    <div className="absolute top-4 right-4">
                      <Badge variant={getLevelBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-white">{session.topic}</h3>
                    {/* <p className="text-sm text-gray-200">
                      {session.description}
                    </p> */}
                    <p className="text-xs text-gray-300">
                      {formatDate(session.startTime)} –{" "}
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={18} className="text-green-400" />
                        <span className="text-lg font-bold">
                          {session.sessionFee}/-
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/session/details/${session._id}`)
                          }
                        >
                          View Details
                        </Button>

                        {isScheduled ? (
                          <Button variant="secondary" disabled>
                            Scheduled
                          </Button>
                        ) : session.participants.length >= 25 ? (
                          <Button variant="secondary" disabled>
                            Session Full
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() =>
                              handlePayToSchedule(
                                session._id,
                                session.sessionFee
                              )
                            }
                          >
                            Pay to Schedule
                          </Button>
                        )}
                      </div>
                    </div>
                  </SpokelyCard>
                );
              })}
            </div>
          </>
        ) : (
          !loading &&
          todayUpcoming.length === 0 && (
            <SpokelyCard
              variant="secondary"
              className="text-center py-12 bg-white/10"
            >
              <div className="max-w-md mx-auto">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  No sessions found
                </h3>
                <p className="text-gray-400">
                  {searchTerm || selectedFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "No public sessions are currently available"}
                </p>
              </div>
            </SpokelyCard>
          )
        )}
      </main>

      {/* PayPal Modal */}
      {showPayPalModal && activeSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => (isProcessing ? null : setShowPayPalModal(false))}
              className={`absolute top-2 right-2 ${
                isProcessing
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              disabled={isProcessing}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Complete Payment</h2>
            <div id="paypal-button-container" />
            {isProcessing && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Finalizing payment… please wait
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Result Modal */}
      {paymentResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-center">
            <h2
              className={`text-lg font-bold mb-4 ${
                paymentResult.status === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {paymentResult.status === "success"
                ? "Payment Successful"
                : "Payment Failed"}
            </h2>
            <p className="text-gray-700 mb-6">{paymentResult.message}</p>
            <button
              onClick={() => setPaymentResult(null)}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorPublicSessions;
