import { useEffect, useState } from "react";
import { getUserStats } from "../../../services/authServices";

const LearningLevelsCard = () => {
  const [stats, setStats] = useState<{
    dailyTasksCompleted: number;
    levels: number;
  } | null>(null);

  const totalLevels = 7;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await getUserStats();
        setStats(res);
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };

    loadStats();
  }, []);

  if (!stats)
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <p className="text-gray-300">Loading levels...</p>
      </div>
    );

  const dailyTasks = stats.dailyTasksCompleted || 0;

  const currentLevel = Math.floor(dailyTasks / 5);

  const tasksIntoCurrentLevel = dailyTasks % 5;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">Learning Levels</h3>

      <p className="text-sm text-gray-300 mb-4">
        Complete{" "}
        <span className="text-lime-400 font-semibold">5 daily tasks</span> to
        unlock the next level.
      </p>

      <div className="space-y-3">
        {[...Array(totalLevels)].map((_, i) => {
          const levelNumber = i + 1;
          const unlocked = levelNumber <= currentLevel;
          const isNextLevel = levelNumber === currentLevel + 1;
          const locked = levelNumber > currentLevel + 1;

          return (
            <div
              key={levelNumber}
              className={`p-4 rounded-lg border transition-colors ${
                unlocked
                  ? "bg-lime-100/10 border-lime-300/30"
                  : locked
                  ? "bg-gray-800/40 border-gray-700"
                  : "bg-white/10 border-white/20 hover:border-lime-300/40"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    unlocked
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
                    unlocked
                      ? "text-lime-300"
                      : locked
                      ? "text-gray-400"
                      : "text-white"
                  }`}
                >
                  Level {levelNumber}
                </p>

                {unlocked && <span className="text-lime-400">✓</span>}
              </div>

              {/* Show task progress under next level */}
              {isNextLevel && tasksIntoCurrentLevel !== 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {tasksIntoCurrentLevel} / 5 tasks completed
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningLevelsCard;
