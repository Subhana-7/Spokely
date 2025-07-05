import MentorHeader from './DashboardComponents/Header';
import MentorGreeting from './DashboardComponents/MentorGreeting';
import StatsCards from './DashboardComponents/StatsCards';
import TodaysSessionsCard from './DashboardComponents/TodaysSessionsCard';
import QuickActionsCard from './DashboardComponents/QuickActionsCard';
import RecentActivityCard from './DashboardComponents/RecentActivityCard';

const MentorDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-700">
      <MentorHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <MentorGreeting />
            
            <StatsCards />
            
            <TodaysSessionsCard />
            
            <RecentActivityCard />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;