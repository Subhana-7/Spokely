import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashBoardComponents/Header";
import Button from "../../modals/Button";
import { useAuthStore } from "../../store/userAuthStore";
import { getSubscriptionHistory } from "../../services/subscriptionService";

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
  const userId = user?.id || user?.id;

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await getSubscriptionHistory(userId, page, 6);
      if (res.data?.success) {
        setSubscriptions(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching subscription history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, page]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24 transition-all duration-300">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
          Subscription History
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            No subscription history found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-white/10 backdrop-blur-md bg-white/5">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-white/10 text-gray-200 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Mentor</th>
                    <th className="px-6 py-4">Start Date</th>
                    <th className="px-6 py-4">End Date</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-white/10 hover:bg-white/10 transition"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {sub.planName}
                      </td>
                      <td className="px-6 py-4">
                        {sub.mentor?.name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(sub.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">
                        ₹{sub.price}
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${statusColor(
                          sub.status
                        )}`}
                      >
                        {sub.status}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="primary"
                          className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={handlePrev}
                className="rounded-full bg-gray-700/40 border border-gray-600/60"
              >
                Previous
              </Button>
              <span className="text-gray-400 text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={handleNext}
                className="rounded-full bg-gray-700/40 border border-gray-600/60"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionHistory;
