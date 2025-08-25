
const LearningLevelsCard = () => {
  const levels = [
    { number: 1, title: "Self Introduction", completed: true, locked: false },
    { number: 2, title: "About You", completed: true, locked: false },
    { number: 3, title: "Share your ideal world", completed: false, locked: false },
    { number: 4, title: "Importance of Listening", completed: false, locked: true }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Learning Levels</h3>
      <div className="space-y-3">
        {levels.map((level) => (
          <div
            key={level.number}
            className={`p-4 rounded-lg border transition-colors ${
              level.completed
                ? 'bg-lime-50 border-lime-200'
                : level.locked
                ? 'bg-gray-100 border-gray-200'
                : 'bg-white border-gray-200 hover:border-lime-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                level.completed
                  ? 'bg-lime-400 text-white'
                  : level.locked
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {level.locked ? '🔒' : level.number}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  level.completed
                    ? 'text-lime-800'
                    : level.locked
                    ? 'text-gray-500'
                    : 'text-gray-800'
                }`}>
                  {level.title}
                </p>
              </div>
              {level.completed && (
                <div className="text-lime-400">
                  ✓
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningLevelsCard;
