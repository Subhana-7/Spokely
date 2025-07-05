import DashboardHeader from './DashBoardComponents.jsx/Header';
import GreetingBanner from './DashBoardComponents.jsx/GreetingsBanner';
import StreakCard from './DashBoardComponents.jsx/StreakCard';
import DailyChallengeCard from './DashBoardComponents.jsx/DailyChallengeCard';
import UpcomingSessionsCard from './DashBoardComponents.jsx/UpcomingSessionsCard';
import LearningLevelsCard from './DashBoardComponents.jsx/LearningLevelsCard';
import TipOfTheDayCard from './DashBoardComponents.jsx/TipOfTheDayCard';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <GreetingBanner />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <StreakCard />
                <DailyChallengeCard />
              </div>
              <UpcomingSessionsCard />
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <LearningLevelsCard />
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8">
          <TipOfTheDayCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
