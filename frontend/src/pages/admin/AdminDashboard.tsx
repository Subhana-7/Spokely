import { useEffect, useState } from "react";
import DashboardHeader from "../../components/admin/DashboardHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { getAdminHomeStats, getReports } from "../../services/adminService";
import { Users, GraduationCap, Wallet, Coins, BookOpen, Link, CalendarCheck } from "lucide-react";
import { Outlet } from "react-router-dom";
import toast from "react-hot-toast";

interface DashboardStats {
  totalUsers: number;
  totalMentors: number;
  totalSessions: number;
  totalPayments: number;
  totalConnections: number;
  totalSubscriptions: number;
  totalDailyTasks: number;
  walletBalance: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sessionTrends, setSessionTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminHomeStats(); // GET /api/admin/home
      const reportRes = await getReports({ type: "session" }); // GET /api/admin/reports?type=session

      // Mock aggregation for weekly trends
      const sessionData = (reportRes?.data?.data || []).reduce(
        (acc: Record<string, number>, s: any) => {
          const date = new Date(s.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {}
      );

      setStats(data);
      setSessionTrends(
        Object.entries(sessionData).map(([date, count]) => ({
          date,
          count,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "from-indigo-500 to-blue-400",
    },
    {
      label: "Total Mentors",
      value: stats?.totalMentors || 0,
      icon: GraduationCap,
      color: "from-green-500 to-emerald-400",
    },
    {
      label: "Total Sessions",
      value: stats?.totalSessions || 0,
      icon: BookOpen,
      color: "from-orange-500 to-yellow-400",
    },
    {
      label: "Payments",
      value: `$${stats?.totalPayments || 0}`,
      icon: Coins,
      color: "from-pink-500 to-rose-400",
    },
    {
      label: "Wallets",
      value: `$${stats?.walletBalance || 0}`,
      icon: Wallet,
      color: "from-teal-500 to-cyan-400",
    },
    {
      label: "Connections",
      value: stats?.totalConnections || 0,
      icon: Link,
      color: "from-purple-500 to-fuchsia-400",
    },
    {
      label: "Subscriptions",
      value: stats?.totalSubscriptions || 0,
      icon: CalendarCheck,
      color: "from-blue-500 to-cyan-400",
    },
    {
      label: "Daily Tasks",
      value: stats?.totalDailyTasks || 0,
      icon: BookOpen,
      color: "from-yellow-500 to-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <DashboardHeader />

      <div className="p-4 md:p-8">
        <div className="bg-white/5 rounded-2xl shadow-lg backdrop-blur-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Admin Dashboard Overview
          </h1>

          {loading ? (
            <p className="text-gray-300 text-center">Loading stats...</p>
          ) : (
            <>
              {/* --- Stats Cards --- */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map(({ label, value, icon: Icon, color }, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl bg-gradient-to-br ${color} shadow-lg flex items-center justify-between`}
                  >
                    <div>
                      <p className="text-sm text-white/80">{label}</p>
                      <h2 className="text-2xl font-bold text-white mt-1">
                        {value}
                      </h2>
                    </div>
                    <Icon className="w-8 h-8 text-white/90" />
                  </div>
                ))}
              </div>

              {/* --- Charts Section --- */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Session Trends */}
                <div className="bg-slate-800/60 rounded-xl p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Weekly Session Trends
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sessionTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="date" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Payment Distribution */}
                <div className="bg-slate-800/60 rounded-xl p-4 shadow-md">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Total Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={statCards.slice(3, 7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="label" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* --- Child Routes Placeholder (Outlet) --- */}
              <div className="mt-10">
                <Outlet />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
