import { Calendar, Users, MessageSquare } from 'lucide-react';

const QuickActionsCard = () => {
  const actions = [
    {
      title: 'Schedule Session',
      icon: Calendar,
      description: 'Book a new session'
    },
    {
      title: 'Evaluate Student',
      icon: Users,
      description: 'Review progress'
    },
    {
      title: 'Give Feedback',
      icon: MessageSquare,
      description: 'Share thoughts'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-yellow-400">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <button 
              key={index}
              className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-yellow-50 rounded-lg border border-gray-200 hover:border-yellow-400 transition-colors text-left"
            >
              <IconComponent size={20} className="text-yellow-600" />
              <div>
                <div className="font-medium text-gray-800">{action.title}</div>
                <div className="text-sm text-gray-500">{action.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;