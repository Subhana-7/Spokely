
import React from 'react';

const DailyChallengeCard = () => {
  const challenges = [
    { text: "Learn a new word", completed: true },
    { text: "Attend at least one session", completed: false },
    { text: "Practice pronunciation", completed: false },
    { text: "Complete at least 3 levels", completed: false },
    { text: "Daily Assignments", completed: true },
    { text: "Daily Quiz", completed: false }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Challenge</h3>
      <div className="space-y-3">
        {challenges.map((challenge, index) => (
          <button
            key={index}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              challenge.completed
                ? 'bg-lime-50 border-lime-200 text-lime-800'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                challenge.completed 
                  ? 'bg-lime-400 border-lime-400' 
                  : 'border-gray-300'
              }`}>
                {challenge.completed && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <span className="text-sm font-medium">{challenge.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DailyChallengeCard;
