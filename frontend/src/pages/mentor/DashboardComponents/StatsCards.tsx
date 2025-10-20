import React from "react";

const StatsCards = ({ stats }: { stats: any }) => {
  const display = [
    { title: "Total Students", value: `${stats.totalStudents} / 25`, description: "Active learners (cap 25)" },
    { title: "Today's Sessions", value: `${stats.todaysSessionsCount}`, description: "Scheduled for today" },
    { title: "Average Progress", value: `${stats.avgProgress}%`, description: "Session completion rate" },
    { title: "Average Feedback", value: `${stats.avgFeedback}${stats.avgFeedbackValue ? ` (${stats.avgFeedbackValue})` : ""}`, description: "Student rating" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {display.map((stat, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{stat.title}</h3>
            <div className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
