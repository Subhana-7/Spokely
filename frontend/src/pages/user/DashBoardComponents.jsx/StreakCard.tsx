
import React from 'react';

const StreakCard = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="text-center">
        <div className="text-3xl mb-2">🔥</div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">7 Day Streak</h3>
        <p className="text-gray-600 text-sm">Keep it going!</p>
      </div>
    </div>
  );
};

export default StreakCard;
