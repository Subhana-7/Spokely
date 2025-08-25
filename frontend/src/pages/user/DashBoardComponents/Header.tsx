import { Bell, Moon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/userAuthStore";
import { logoutService } from "../../../services/authServices";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutService();
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className="fixed top-0 w-full z-20 bg-black/30 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div
          onClick={() => navigate("/user/home")}
          className="text-2xl font-bold text-white cursor-pointer drop-shadow-lg"
        >
          Spokely
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => navigate("/user/home")}
            className="text-gray-200 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/user/session")}
            className="text-gray-200 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Sessions
          </button>
          <button
            onClick={() => navigate("/user/mentors")}
            className="text-gray-200 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Mentors
          </button>
          <button
            onClick={() => navigate("/user/connections")}
            className="text-gray-200 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            Connections
          </button>
        </nav>

        {/* Icons + Logout */}
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Moon size={20} />
          </button>
          <button className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button
            onClick={() => navigate("/user/profile")}
            className="p-2 text-gray-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <User size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-red-400 hover:text-white hover:bg-red-600 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
