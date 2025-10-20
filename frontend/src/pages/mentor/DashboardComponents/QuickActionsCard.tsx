import { Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActionsCard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Schedule Session",
      icon: Calendar,
      description: "Book a new session",
      path: "/mentor/sessions",
    },
    {
      title: "Evaluate Student",
      icon: Users,
      description: "Review learner progress",
      path: "/mentor/my-students",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border-2 border-yellow-400 transition-colors">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        Quick Actions
      </h2>

      {/* Flex row with wrap for smaller screens */}
      <div className="flex flex-row flex-wrap gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(action.path)}
              className="cursor-pointer flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-100/10 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-yellow-400 transition-all shadow-sm hover:shadow-md flex-1 min-w-[250px]"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                <Icon size={22} className="text-yellow-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {action.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {action.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsCard;
