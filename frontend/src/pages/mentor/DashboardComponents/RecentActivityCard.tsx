import { CheckCircle } from "lucide-react";

const RecentActivityCard = ({ activities }: { activities: any[] }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="text-sm text-gray-500">No recent activity.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <CheckCircle size={20} className="text-green-500 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{activity.type}</div>
              <div className="text-sm text-gray-600">
                {activity.feedback || activity.comment || "—"}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {activity.studentName ? `${activity.studentName} – ` : ""}
                {activity.time ? new Date(activity.time).toLocaleString() : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivityCard;
