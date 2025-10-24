import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import DashboardHeader from "./DashBoardComponents/Header";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { getPublicMentors } from "../../services/mentorListing";

interface Mentor {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  uniqueCode: string;
  sessionsDone: number;
  bio?: string;
  createdAt: string;
}

const PublicMentorListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const res = await getPublicMentors();
        setMentors(res?.data?.result?.mentors || []);
      } catch (error) {
        console.error("Error fetching mentors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MentorCard = ({ mentor }: { mentor: Mentor }) => {
    return (
      <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 text-white shadow-lg transition hover:scale-[1.02] hover:border-emerald-500">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden mr-3">
            {mentor.profilePicture ? (
              <img
                src={mentor.profilePicture}
                alt={mentor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {mentor.name[0]}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{mentor.name}</h3>
            <Badge variant="peer" size="sm">
              Mentor
            </Badge>
          </div>
        </div>

        {mentor.bio && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {mentor.bio}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 text-center">
          <div>
            <div className="text-green-400 text-xl font-bold">
              {mentor.sessionsDone}
            </div>
            <div className="text-gray-400 text-xs">Sessions Done</div>
          </div>
          <div>
            <div className="text-green-400 text-xl font-bold">
              {mentor.uniqueCode}
            </div>
            <div className="text-gray-400 text-xs">Code</div>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate(`/user/mentor-profile/${mentor.id}`)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg transition-all"
        >
          View Profile
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24 transition-all duration-300">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent tracking-tight">
          Public Mentors
        </h2>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search mentors by name..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="pl-12 pr-4 py-3 text-sm border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-800 text-white placeholder-gray-400 shadow-md"
            />
          </div>
        </div>

        {/* Mentor Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-400 font-medium text-lg">
              Loading mentors...
            </div>
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            No mentors found — try a different name.
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicMentorListing;
