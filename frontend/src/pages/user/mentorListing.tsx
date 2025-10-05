import React, { useEffect, useState } from "react";
import { Search, Plus, MessageCircle } from "lucide-react";
import SpokelyCard from "../../components/common/Cards";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import DashboardHeader from "./DashBoardComponents/Header";
import { getUserSubscriptions } from "../../services/subscriptionService";
import { useAuthStore } from "../../store/userAuthStore";
import { useNavigate } from "react-router-dom";

interface Mentor {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  sessionsDone: number;
  tags: string[];
}

interface Subscription {
  _id: string;
  userId: string;
  mentorId: string | Mentor;
  mentor: Mentor;
  plan: string;
  price: number;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED";
  startDate: string;
  sessionsCount: number;
  sessionsByUser: number;
  avgRating: number | null;
}

const SpokelyMentors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const status = ["ACTIVE", "CANCELLED", "EXPIRED"];
  const userId = useAuthStore((state) => state.user?.id!);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getUserSubscriptions(userId as string);
        // Axios response → res.data
        setSubscriptions(res.data || []);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const filteredMentors = subscriptions.filter((sub) => {
    const mentor = sub.mentor;
    if (!mentor) return false;

    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub._id.toString().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "All" || sub.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  console.log(subscriptions);

  const MentorCard = ({ sub }: { sub: Subscription }) => {
    const mentor = sub.mentor;
    return (
      <SpokelyCard className="bg-gray-900 border border-gray-700 text-gray-200 hover:border-emerald-400">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3 overflow-hidden">
            {mentor?.profilePicture ? (
              <img
                src={mentor.profilePicture}
                alt={mentor.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white">{mentor.name[0]}</span> // fallback initial
            )}
          </div>
          <div>
            <h3 className="font-semibold text-black">{mentor?.name}</h3>
            <Badge variant="peer" size="sm">
              {sub.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <div className="text-emerald-400 text-xl font-bold">
              {sub.sessionsCount}
            </div>
            <div className="text-gray-400 text-xs">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-400 text-xl font-bold">
              {sub.avgRating ? sub.avgRating.toFixed(1) : "—"}
            </div>
            <div className="text-gray-400 text-xs">Avg Rating</div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate(`/user/mentor-profile/${mentor._id}`)}
        >
          View Details
        </Button>
      </SpokelyCard>
    );
  };

  return (
    <div
      className="min-h-screen text-white relative bg-cover bg-center"
      style={{ backgroundImage: `url('/gradient-bg.jpg')` }}
    >
      <DashboardHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        {/* Section Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Mentors</h1>
          <p className="text-gray-600">
            Connect with and learn from experienced mentors
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 mb-10">
          <SpokelyCard className="bg-white/10 border shadow-lg text-center min-w-[120px]">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {subscriptions.length}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">
              Total Mentors
            </div>
          </SpokelyCard>
          <SpokelyCard className="bg-white/10 border shadow-lg text-center min-w-[120px]">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {subscriptions.length > 0
                ? (
                    subscriptions.reduce(
                      (acc, s) => acc + (s.avgRating || 0),
                      0
                    ) / subscriptions.filter((s) => s.avgRating).length
                  ).toFixed(1)
                : "—"}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">
              Average Score
            </div>
          </SpokelyCard>
          <SpokelyCard className="bg-white/10 border shadow-lg text-center min-w-[120px]">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {subscriptions.reduce(
                (acc, s) => acc + (s.sessionsCount || 0),
                0
              )}
            </div>
            <div className="text-xs text-gray-300 uppercase tracking-wide">
              Total Sessions
            </div>
          </SpokelyCard>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center mb-10">
          <div className="flex-1 min-w-[300px] relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search mentors by ID or name..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-10 h-12 bg-gray border-gray-300 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              key="All"
              variant={selectedStatus === "All" ? "success" : "secondary"}
              onClick={() => setSelectedStatus("All")}
              className="px-4 py-2"
            >
              All
            </Button>
            {status.map((level) => (
              <Button
                key={level}
                variant={selectedStatus === level ? "success" : "secondary"}
                onClick={() => setSelectedStatus(level)}
                className="px-4 py-2"
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredMentors.map((sub) => (
              <MentorCard key={sub._id} sub={sub} />
            ))}
          </div>
        )}

        {!loading && filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No mentors found</div>
            <div className="text-gray-500 text-sm">
              Try adjusting your search or filters
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/user/schedule-session")}
        className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default SpokelyMentors;
