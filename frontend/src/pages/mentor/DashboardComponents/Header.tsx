import { Bell, Moon, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/userAuthStore';
import { logoutService } from '../../../services/authServices';

const MentorHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutService('mentor');
    logout();
    navigate("/");
  };

  // Helper for nav button styling
  const navButtonClass = (path: string) =>
    `text-gray-300 font-medium px-4 py-2 rounded-lg transition-colors ${
      location.pathname === path
        ? "text-white bg-slate-700"
        : "hover:text-white hover:bg-slate-700"
    }`;

  return (
    <header className="bg-slate-800 border-b border-slate-600 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => navigate("/mentor/home")}>
          Spokely
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => navigate('/mentor/home')} className={navButtonClass('/mentor/home')}>
            Dashboard
          </button>
          <button onClick={() => navigate('/mentor/sessions')} className={navButtonClass('/mentor/sessions')}>
            Sessions
          </button>
          <button onClick={() => navigate('/mentor/my-students')} className={navButtonClass('/mentor/my-students')}>
            Learners
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Moon size={20} />
          </button>
          <button className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button onClick={() => navigate("/mentor/profile")} className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default MentorHeader;
