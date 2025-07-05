import React from 'react';
import { Bell, Moon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // if you're using react-router

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("spokely_token");
    localStorage.removeItem("spokely_user_id");
    // If you store role or anything else, clear that too
    localStorage.removeItem("spokely_role");

    // Optional: show a toast/snackbar message
    // toast.success("Logged out successfully");

    navigate("/"); // redirect to login page
  };

  return (
     <header className="bg-slate-800 border-b border-slate-600 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">Spokely</div>

        <nav className="hidden md:flex items-center space-x-8">
          <button className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Dashboard
          </button>
          <button className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Sessions
          </button>
          <button className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Mentors
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Moon size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
