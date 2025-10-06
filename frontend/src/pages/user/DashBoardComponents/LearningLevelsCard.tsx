import { useAuthStore } from "../../../store/userAuthStore";

const LearningLevelsCard = () => {
  const { user } = useAuthStore();
  const currentLevel = user?.level || 0;

  const totalLevels = 7; 

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">Learning Levels</h3>

      <p className="text-sm text-gray-300 mb-4">
        Complete <span className="text-lime-400 font-semibold">5 daily tasks</span> to unlock the next level.
      </p>

      <div className="space-y-3">
        {[...Array(totalLevels)].map((_, i) => {
          const levelNumber = i + 1;
          const completed = levelNumber <= currentLevel;
          const locked = levelNumber > currentLevel + 1;

          return (
            <div
              key={levelNumber}
              className={`p-4 rounded-lg border transition-colors ${
                completed
                  ? "bg-lime-100/10 border-lime-300/30"
                  : locked
                  ? "bg-gray-800/40 border-gray-700"
                  : "bg-white/10 border-white/20 hover:border-lime-300/40"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    completed
                      ? "bg-lime-400 text-white"
                      : locked
                      ? "bg-gray-500 text-gray-300"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {locked ? "🔒" : levelNumber}
                </div>
                <p
                  className={`font-medium ${
                    completed
                      ? "text-lime-300"
                      : locked
                      ? "text-gray-400"
                      : "text-white"
                  }`}
                >
                  Level {levelNumber}
                </p>
                {completed && <span className="text-lime-400">✓</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningLevelsCard;
