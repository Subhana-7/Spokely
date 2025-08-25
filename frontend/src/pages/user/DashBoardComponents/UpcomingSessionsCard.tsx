
const UpcomingSessionsCard = () => {
  const sessions = [
    { time: "9 AM", title: "Daily Mentor Session" },
    { time: "12 PM", title: "Session with Alice" }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Upcoming Sessions</h3>
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="bg-lime-400 text-white px-3 py-1 rounded-lg text-sm font-semibold">
              {session.time}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 font-medium">{session.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingSessionsCard;
