const TodaysSessionsCard = () => {
  const sessions = [
    {
      time: '9 AM',
      mentor: '#102 Alice',
      learner: '#107 Clara',
      link: 'www.scheduledsession.link'
    },
    {
      time: '11 AM',
      mentor: '#103 Bob',
      learner: '#108 David',
      link: 'www.scheduledsession.link'
    },
    {
      time: '2 PM',
      mentor: '#104 Emma',
      learner: '#109 Frank',
      link: 'www.scheduledsession.link'
    },
    {
      time: '4 PM',
      mentor: '#105 Grace',
      learner: '#110 Helen',
      link: 'www.scheduledsession.link'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {session.time}
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {session.mentor} — {session.learner}
                </div>
                <div className="text-sm text-gray-500">{session.link}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysSessionsCard;
