import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  IndianRupee,
  Plus,
} from "lucide-react";
import type { PayPalNamespace } from "@paypal/paypal-js";
import Header from "../user/DashBoardComponents/Header";
import SpokelyCard from "../../components/common/Cards";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import Button from "../../modals/Button";
import { getPublicSessions } from "../../services/sessionService";
import { startPayment, confirmPayment } from "../../services/paymentService";
import { useAuthStore } from "../../store/userAuthStore";

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

  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [activeSession, setActiveSession] = useState<{ id: string; fee: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [paymentResult, setPaymentResult] = useState<{ status: "success" | "error"; message: string } | null>(null);

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

  const handlePayToSchedule = async (sessionId: string, sessionFee: number) => {
    if (!sessionFee || sessionFee <= 0) {
      setPaymentResult({ status: "error", message: "Invalid session fee. Cannot proceed with payment." });
      return;
    }

    try {
      setActiveSession({ id: sessionId, fee: sessionFee });
      setShowPayPalModal(true);

      const result = await startPayment(sessionId, sessionFee);

      setSessions((prev) =>
        prev.map((s) =>
          s._id === sessionId
            ? {
                ...s,
                participants: [...s.participants, { user: user?.id || "", status: "accepted" }],
              }
            : s
        )
      );

      setPaymentResult({
        status: "success",
        message: result?.message || "Your payment was successful! Session scheduled 🎉",
      });
    } catch (err: any) {
      console.error("Payment failed:", err);
      setPaymentResult({ status: "error", message: "Payment failed. Please try again." });
    } finally {
      setShowPayPalModal(false);
    }
  };

  useEffect(() => {
    if (!showPayPalModal || !activeSession) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    container.innerHTML = "";

    if (!window.paypal) {
      const fallback = document.createElement("div");
      fallback.className = "text-red-600 text-sm";
      fallback.innerText = "PayPal failed to load. Please refresh and try again.";
      container.appendChild(fallback);
      return;
    }

    if (window.paypal.Buttons) {
      const buttons = window.paypal.Buttons({
        createOrder: async () => {
          try {
            const resp: PaymentResponse = await startPayment(activeSession.id, activeSession.fee);
            const orderId = resp?.orderId || resp?.id || resp?.data?.orderId;
            if (!orderId) throw new Error("No order ID returned from backend.");
            return orderId;
          } catch (e: any) {
            console.error("createOrder error:", e);
            setShowPayPalModal(false);
            setPaymentResult({
              status: "error",
              message: e?.message || "Failed to create order. Please try again.",
            });
            throw e;
          }
        },

        onApprove: async (data: any) => {
          try {
            setIsProcessing(true);
            const orderId = data.orderID;
            const verify = await confirmPayment(orderId, activeSession.id);
            const ok = !!verify?.success;

            if (ok) {
              setSessions((prev) =>
                prev.map((s) => {
                  if (s._id !== activeSession.id) return s;
                  const already = s.participants.some((p) => p.user === (user?.id || ""));
                  return {
                    ...s,
                    participants: already
                      ? s.participants
                      : [...s.participants, { user: user?.id || "", status: "accepted" }],
                  };
                })
              );

              setPaymentResult({
                status: "success",
                message: verify?.message || "Your payment was successful! Session scheduled 🎉",
              });
            } else {
              setPaymentResult({
                status: "error",
                message: verify?.message || "Payment verification failed. Please contact support.",
              });
            }
          } catch (e: any) {
            console.error("onApprove/confirm error:", e);
            setPaymentResult({
              status: "error",
              message: e?.message || "Payment failed to verify. Please try again.",
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
            message: "Payment was cancelled.",
          });
        },

        onError: (err: any) => {
          console.error("PayPal onError:", err);
          setShowPayPalModal(false);
          setPaymentResult({
            status: "error",
            message: "A payment error occurred. Please try again.",
          });
        },
      });

      buttons.render("#paypal-button-container");

      return () => {
        try {
          buttons.close && buttons.close();
        } catch {}
      };
    }
  }, [showPayPalModal, activeSession, user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLevelBadgeVariant = (status: string): "accepted" | "mentor" | "peer" | "public" | "upcoming" | "completed" | "private" | "pending" | "cancelled" => {
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
          <h1 className="text-3xl font-bold text-white mb-2">Public Sessions</h1>
          <p className="text-gray-300">
            Discover and join our mentor's upcoming public sessions
          </p>
        </div>

        {/* Search & Filter */}
        <SpokelyCard className="mb-8 bg-white/10 border shadow-lg" padding="md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search sessions by topic or description..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="pl-10 h-12 bg-white border-gray-300"
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
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </SpokelyCard>

        {/* Sessions */}
        {loading ? (
          <p className="text-center text-gray-600">Loading sessions...</p>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => {
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
                  <p className="text-sm text-gray-200">{session.description}</p>
                  <p className="text-xs text-gray-300">
                    {formatDate(session.startTime)} –{" "}
                    {new Date(session.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <IndianRupee size={18} className="text-green-400" />
                      <span className="text-lg font-bold">
                        {session.sessionFee}/-
                      </span>
                    </div>

                    {isScheduled ? (
                      <Button variant="secondary" disabled>
                        Scheduled
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={() =>
                          handlePayToSchedule(session._id, session.sessionFee)
                        }
                      >
                        Pay to Schedule
                      </Button>
                    )}
                  </div>
                </SpokelyCard>
              );
            })}
          </div>
        ) : (
          <SpokelyCard variant="secondary" className="text-center py-12 bg-white/10">
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
        )}
      </main>

      {/* PayPal Modal */}
      {showPayPalModal && activeSession && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <button
              onClick={() => (isProcessing ? null : setShowPayPalModal(false))}
              className={`absolute top-2 right-2 ${
                isProcessing ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:text-gray-800"
              }`}
              disabled={isProcessing}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Complete Payment</h2>

            {/* PayPal renders here */}
            <div id="paypal-button-container" />

            {isProcessing && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Finalizing payment… please wait
              </div>
            )}
          </div>
        </div>
      )}

      {paymentResult && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative text-center">
            <h2
              className={`text-lg font-bold mb-4 ${
                paymentResult.status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {paymentResult.status === "success" ? "Payment Successful" : "Payment Failed"}
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