import { useState, useEffect } from "react";
import MentorHeader from "./mentor/DashboardComponents/Header";
import Header from "./user/DashBoardComponents/Header";
import SpokelyCard from "../components/common/Cards";
import { Award, ArrowUp, ArrowDown, Wallet as WalletIcon } from "lucide-react";
import { wallet as fetchWallet } from "../services/paymentService";
import { useAuthStore } from "../store/userAuthStore";
import type { AxiosResponse } from "axios";

interface IWalletTransaction {
  type: "CREDIT" | "DEBIT";
  amount: number;
  reason: string;
  sessionId?: string;
  subscriptionId?: string;
  createdAt?: string;
}

interface IWalletResponse {
  message: string;
  transactions: IWalletTransaction[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const WalletPage = () => {
  const { user } = useAuthStore();

  const [transactions, setTransactions] = useState<IWalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 5;

  useEffect(() => {
    const getWalletData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response: AxiosResponse<IWalletResponse> = await fetchWallet(
          page,
          limit
        );
        const res = response.data;
        console.log(res);

        const walletData = (res as any).data || res;

        if (Array.isArray(walletData.transactions)) {
          setTransactions(walletData.transactions);
          setTotalPages(walletData.totalPages);
        } else {
          console.warn("Wallet data is not an array:", walletData.transactions);
          setTransactions([]);
        }
      } catch (err) {
        console.error("Failed to fetch wallet:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    getWalletData();
  }, [user, page]);

  const balance = Array.isArray(transactions)
    ? transactions.reduce(
        (acc, tx) => (tx.type === "CREDIT" ? acc + tx.amount : acc - tx.amount),
        0
      )
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {user?.role === "mentor" ? <MentorHeader /> : <Header />}

      <div className="max-w-7xl mx-auto p-8 space-y-10 py-20">
        {/* Wallet Balance */}
        <SpokelyCard className="p-10 bg-white/10 backdrop-blur-lg border border-white/20 flex flex-col md:flex-row items-center md:items-start gap-10">
          <WalletIcon size={60} className="text-green-400" />
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Wallet Balance</h1>
            <p className="text-gray-300 text-xl mt-2">₹{balance.toFixed(2)}</p>
          </div>
        </SpokelyCard>

        {/* Transaction List */}
        <SpokelyCard className="p-6 bg-white/10 border border-white/20">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Award size={22} className="text-green-400" /> Transactions
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              <span className="ml-3 text-gray-300">
                Loading transactions...
              </span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No transactions yet.
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {transactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      tx.type === "CREDIT"
                        ? "bg-green-900/20 border-green-500/40"
                        : "bg-red-900/20 border-red-500/40"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-white">
                        {tx.reason}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      {tx.type === "CREDIT" ? (
                        <ArrowUp size={18} className="text-green-400" />
                      ) : (
                        <ArrowDown size={18} className="text-red-400" />
                      )}
                      ₹{tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-8 gap-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={`px-4 py-2 rounded-lg border border-gray-600 ${
                    page === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/10"
                  }`}
                >
                  Prev
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className={`px-4 py-2 rounded-lg border border-gray-600 ${
                    page === totalPages
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-white/10"
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </SpokelyCard>
      </div>
    </div>
  );
};

export default WalletPage;
