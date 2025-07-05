import { CheckCircle } from 'lucide-react';

const RecentActivityCard = () => {
  const activities = [
    {
      type: 'Session Completed',
      feedback: 'Feedback: Good',
      student: 'Alice',
      time: '12:00 PM'
    },
    {
      type: 'Session Completed',
      feedback: 'Feedback: Excellent',
      student: 'Bob',
      time: '10:30 AM'
    },
    {
      type: 'Session Completed',
      feedback: 'Feedback: Good',
      student: 'Clara',
      time: '9:15 AM'
    },
    {
      type: 'Evaluation Submitted',
      feedback: 'Progress: Improved',
      student: 'David',
      time: '8:45 AM'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <CheckCircle size={20} className="text-green-500 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{activity.type}</div>
              <div className="text-sm text-gray-600">{activity.feedback}</div>
              <div className="text-sm text-gray-500 mt-1">
                {activity.student} – {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;