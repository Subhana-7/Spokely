const StatsCards = () => {
  const stats = [
    {
      title: 'Total Students',
      value: '23 / 50',
      description: 'Active learners'
    },
    {
      title: "Today's Sessions",
      value: '12',
      description: 'Scheduled'
    },
    {
      title: 'Average Progress',
      value: '92%',
      description: 'Student completion'
    },
    {
      title: 'Average Feedback',
      value: 'Good',
      description: 'Student rating'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
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