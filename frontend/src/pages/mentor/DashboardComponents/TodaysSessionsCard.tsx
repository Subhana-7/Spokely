import React from "react";

const formatTime = (dateStrOrObj: any) => {
  if (!dateStrOrObj) return "";
  const d = new Date(dateStrOrObj);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TodaysSessionsCard = ({ sessions }: { sessions: any[] }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Sessions</h2>
        <div className="text-sm text-gray-500">No sessions scheduled for today.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {formatTime(session.time)}
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {session.topic || `Session ${session.id}`}
                </div>
                <div className="text-sm text-gray-500">{session.recordingLink || `Status: ${session.status}`}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysSessionsCard;
