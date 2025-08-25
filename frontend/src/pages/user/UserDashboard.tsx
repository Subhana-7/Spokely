import DashboardHeader from './DashBoardComponents/Header';
import GreetingBanner from './DashBoardComponents/GreetingsBanner';
import StreakCard from './DashBoardComponents/StreakCard';
import DailyChallengeCard from './DashBoardComponents/DailyChallengeCard';
import UpcomingSessionsCard from './DashBoardComponents/UpcomingSessionsCard';
import LearningLevelsCard from './DashBoardComponents/LearningLevelsCard';
import TipOfTheDayCard from './DashBoardComponents/TipOfTheDayCard';

const Dashboard = () => {
  return (
    <div
      className="min-h-screen text-white relative"
      style={{
        backgroundImage: `url('/gradient-bg.jpg')`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for glow effect */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Header */}
      {/* <div className="relative z-10"> */}
        <DashboardHeader />
      {/* </div> */}

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            <GreetingBanner />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                {/* Card Wrappers with blur + glow */}
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
                  <StreakCard />
                </div>
                <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
                  <DailyChallengeCard />
                </div>
              </div>

              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
                <UpcomingSessionsCard />
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <LearningLevelsCard />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <TipOfTheDayCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
