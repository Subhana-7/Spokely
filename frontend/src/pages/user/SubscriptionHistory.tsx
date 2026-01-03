import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashBoardComponents/Header";
import Button from "../../modals/Button";
import { useAuthStore } from "../../store/userAuthStore";
import { getSubscriptionHistory } from "../../services/subscriptionService";
import {
  subscriptionStartPayment,
  subscriptionConfirmPayment,
} from "../../services/paymentService";

interface Subscription {
  id: string;
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  sessions: number;
  mentor?: {
    id: string;
    name: string;
    profilePicture?: string;
  } | null;
}

const SubscriptionHistory = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [limit] = useState(6);

  // Renewal states
  const [renewSub, setRenewSub] = useState<Subscription | null>(null);
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --------------------------------------------------
  // Fetch Subscription History
  // --------------------------------------------------
  const fetchHistory = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await getSubscriptionHistory(
        userId,
        page,
        limit,
        search,
        status
      );

      if (res.data?.success) {
        setSubscriptions(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch subscription history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, page, search, status]);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const statusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-green-400";
      case "CANCELLED":
        return "text-red-400";
      case "EXPIRED":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  // --------------------------------------------------
  // Renew Flow
  // --------------------------------------------------
  const handleRenew = (sub: Subscription) => {
    setRenewSub(sub);
    setShowPayPalModal(true);
  };

  useEffect(() => {
    if (!showPayPalModal || !renewSub) return;

    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    const loadPayPal = async () => {
      try {
        const { loadScript } = await import("@paypal/paypal-js");

        const paypal = await loadScript({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
          currency: "USD",
        });

        if (!paypal?.Buttons) return;

        paypal
          .Buttons({
            createOrder: async (): Promise<string> => {
              const res = await subscriptionStartPayment(
                renewSub.id,
                renewSub.price
              );

              const orderId = res.data?.id;

              if (!orderId) {
                throw new Error("PayPal order ID not returned from server");
              }

              return orderId;
            },

            onApprove: async (data: any) => {
              try {
                setIsProcessing(true);

                await subscriptionConfirmPayment(
                  data.orderID,
                  renewSub.id // ✅ same subscriptionId
                );

                await fetchHistory();
              } catch (err) {
                console.error("Renewal failed", err);
              } finally {
                setIsProcessing(false);
                setShowPayPalModal(false);
                setRenewSub(null);
              }
            },

            onCancel: () => {
              setShowPayPalModal(false);
              setRenewSub(null);
            },

            onError: (err: any) => {
              console.error("PayPal error", err);
              setShowPayPalModal(false);
              setRenewSub(null);
            },
          })
          .render("#paypal-button-container");
      } catch (err) {
        console.error("PayPal load error", err);
      }
    };

    loadPayPal();
  }, [showPayPalModal, renewSub]);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Subscription History
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex gap-3 items-center mb-6"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-white/5 border border-white/10 rounded px-5 py-2 text-sm w-72"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
          >
            <option value="All">All</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </form>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No subscription history found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-white/10 text-gray-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Mentor</th>
                    <th className="px-6 py-4">Start</th>
                    <th className="px-6 py-4">End</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-white/10 hover:bg-white/10"
                    >
                      <td className="px-6 py-4 text-white">{sub.planName}</td>

                      <td className="px-6 py-4">{sub.mentor?.name || "—"}</td>

                      <td className="px-6 py-4">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-emerald-400">
                        ₹{sub.price}
                      </td>

                      <td
                        className={`px-6 py-4 font-semibold ${statusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </td>

                      <td className="px-6 py-4">
                        {sub.status === "EXPIRED" ? (
                          <Button
                            onClick={() => handleRenew(sub)}
                            className="bg-emerald-500 hover:bg-emerald-600"
                          >
                            Renew
                          </Button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center gap-4 mt-10">
              <Button disabled={page === 1} onClick={handlePrev}>
                Previous
              </Button>
              <span className="text-gray-400">
                Page {page} of {totalPages}
              </span>
              <Button disabled={page === totalPages} onClick={handleNext}>
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {/* PayPal Modal */}
      {showPayPalModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-300 p-6 rounded-xl w-full max-w-md relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setShowPayPalModal(false)}
              disabled={isProcessing}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Renew Subscription</h2>

            <div id="paypal-button-container"></div>

            {isProcessing && (
              <p className="text-center mt-4">Processing payment...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionHistory;
