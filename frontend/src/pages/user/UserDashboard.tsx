import { useNavigate } from "react-router-dom";

import DashboardHeader from "./DashBoardComponents/Header";
import GreetingBanner from "./DashBoardComponents/GreetingsBanner";
import DailyChallengeCard from "./DashBoardComponents/DailyChallengeCard";
import LearningLevelsCard from "./DashBoardComponents/LearningLevelsCard";
import {
  MessageCircle,
  Users,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

interface QuickAccessCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  route: string;
}

const Dashboard = () => {
  const navigate = useNavigate();

  const QuickAccessCard: React.FC<QuickAccessCardProps> = ({
    icon: Icon,
    title,
    description,
    route,
  }) => (
    <div
      onClick={() => navigate(route)}
      className="cursor-pointer backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-lime-400" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-gray-300">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen text-white relative bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Overlay for subtle glow effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            <GreetingBanner />

            {/* Quick Access Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickAccessCard
                icon={MessageCircle}
                title="Chat"
                description="Connect instantly with mentors and peers."
                route="/user/chat"
              />
              <QuickAccessCard
                icon={CalendarCheck}
                title="Sessions"
                description="Every session gets you one step closer to mastery 🚀"
                route="/user/session"
              />
              <QuickAccessCard
                icon={Users}
                title="Connections"
                description="Grow your circle of learners and mentors."
                route="/user/connections"
              />
            </div>

            {/* Daily Challenge */}
            <div
              onClick={() => navigate("/user/daily/task")}
              className="cursor-pointer backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition"
            >
              <DailyChallengeCard />
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <LearningLevelsCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
