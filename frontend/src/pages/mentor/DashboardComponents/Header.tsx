import { Bell, Moon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/userAuthStore';
import { logoutService } from '../../../services/authServices';

const MentorHeader = () => {

  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logoutService('mentor');
    logout();
    navigate("/")
  }


  return (
    <header className="bg-slate-800 border-b border-slate-600 px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-white">
          Spokely
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => navigate('/mentor/home')} className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Dashboard
          </button>
          <button onClick={() => navigate('/mentor/sessions')} className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
            Sessions
          </button>
          <button className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
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
           className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default MentorHeader;