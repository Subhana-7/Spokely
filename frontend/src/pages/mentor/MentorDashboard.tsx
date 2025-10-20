import React, { useEffect, useState } from "react";
import MentorHeader from './DashboardComponents/Header';
import MentorGreeting from './DashboardComponents/MentorGreeting';
import StatsCards from './DashboardComponents/StatsCards';
import TodaysSessionsCard from './DashboardComponents/TodaysSessionsCard';
import QuickActionsCard from './DashboardComponents/QuickActionsCard';
import RecentActivityCard from './DashboardComponents/RecentActivityCard';
import { home } from "../../services/authServices"; 
import { useAuthStore } from "../../store/userAuthStore";

type DashboardData = {
  mentor: any;
  stats: {
    totalStudents: number;
    todaysSessionsCount: number;
    avgProgress: number;
    avgFeedback: string;
    avgFeedbackValue?: number | null;
  };
  sessionsToday: any[];
  recentActivities: any[];
};

const MentorDashboard = () => {
  const user = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        const res = await home();
        setData(res);
      } catch (err: any) {
        console.error("Failed to fetch dashboard:", err);
        setError(err?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  return (
    <div className="min-h-screen bg-slate-700">
      <MentorHeader />
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading && <div className="text-white">Loading dashboard...</div>}
        {error && <div className="text-red-400">{error}</div>}
        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <MentorGreeting mentor={data.mentor} />
              <StatsCards stats={data.stats} />
              <TodaysSessionsCard sessions={data.sessionsToday} />
              <RecentActivityCard activities={data.recentActivities} />
            </div>
            <div className="space-y-6">
              <QuickActionsCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;
