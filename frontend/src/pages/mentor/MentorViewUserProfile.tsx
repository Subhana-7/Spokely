import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userProfiles } from "../../services/authServices";
import toast from "react-hot-toast";
import { User, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/userAuthStore";
import Header from "../user/DashBoardComponents/Header";
import MentorHeader from "./DashboardComponents/Header";

const MentorViewUserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userProfiles(id!);
        setUser(res.data);
      } catch (e) {
        toast.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading user profile...
      </div>
    );

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        User not found.
      </div>
    );

  return (
    <div
      className={
        `min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white ` +
        (currentUser?.role === "user" ? "pt-20" : "pt-0")
      }
    >
      {currentUser?.role === "user" && <Header />}
      {currentUser?.role === "mentor" && <MentorHeader/>}
      {/* Header */}
      <div className="flex items-center max-w-7xl mx-auto px-6 mb-10 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors mr-4"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-white">
          User Details
        </h1>
      </div>

      {/* Layout */}
      <div className="max-w-4xl mx-auto px-6 flex flex-col gap-8">
        {/* PROFILE CARD */}
        <div className="bg-white/6 backdrop-blur-lg rounded-2xl border border-white/10 p-6 flex gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-white/10">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  className="w-full h-full object-cover"
                  alt={user.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <User className="text-gray-400 w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-2">
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-gray-400">{user.email}</p>

            <div className="flex gap-3 mt-2">
              <div className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                Unique Code: {user.uniqueCode}
              </div>
              <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm border border-purple-500/30">
                Level: {user.levels ?? 0}
              </div>
            </div>

            <div className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm border border-yellow-500/30 w-max mt-3">
              {user.streak ?? 0}-Day Streak
            </div>
          </div>
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white/6 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-6 text-emerald-400">
            <TrendingUp /> Learning Progress
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/40">
              <p className="text-2xl font-bold text-green-400">
                {user.completionRate}%
              </p>
              <p className="text-gray-400 text-sm">Completion Rate</p>
            </div>

            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/40">
              <p className="text-2xl font-bold text-blue-400">
                {user.sessionsDone}
              </p>
              <p className="text-gray-400 text-sm">Sessions Done</p>
            </div>

            <div className="bg-gray-800/40 p-4 rounded-xl border border-gray-700/40">
              <p className="text-2xl font-bold text-purple-400">
                {user.totalConnections}
              </p>
              <p className="text-gray-400 text-sm">Connections</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2 text-sm">
              <span>Overall Progress</span>
              <span>{user.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
                style={{ width: `${user.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* SESSIONS CARD */}
        <div className="bg-white/6 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4 text-blue-400">
            <Calendar /> Session Activity
          </h3>
          <p className="text-gray-400">No session history available.</p>
        </div>
      </div>
    </div>
  );
};

export default MentorViewUserProfile;
