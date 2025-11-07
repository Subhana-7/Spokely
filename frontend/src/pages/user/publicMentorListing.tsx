import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await getPublicMentors(page, search);
      setMentors(res?.data?.mentors || []);
      setTotalPages(res?.data?.totalPages || 1);
    } catch (error) {
      console.error("Error loading mentors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMentors();
    }, 400);
    return () => clearTimeout(timeout);
  }, [page, search]);

  const MentorCard = ({ mentor }: { mentor: Mentor }) => (
    <div className="backdrop-blur-lg bg-white/10 border border-white/10 rounded-2xl p-6 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:border-emerald-500">
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
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{mentor.bio}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-24">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto mb-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <Input
            type="text"
            placeholder="Search mentors by name or email..."
            value={search}
            onChange={(val) => {
              setPage(1);
              setSearch(val);
            }}
            className="pl-12 pr-4 py-3 w-full border border-gray-700 rounded-full focus:ring-2 focus:ring-green-500 bg-gray-800 text-white placeholder-gray-400 shadow-md"
          />
        </div>

        {/* Loading or Results */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 border-4 border-gray-700 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-gray-400 font-medium text-lg">
              Loading mentors...
            </div>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg">
            No mentors found — try a different search.
          </div>
        ) : (
          <>
            {/* Mentor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentors.map((m) => (
                <MentorCard key={m.id} mentor={m} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-full border border-gray-700 hover:border-green-400 hover:text-green-400 transition ${
                  page === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={18} /> Prev
              </button>

              <span className="px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
                Page{" "}
                <span className="text-green-400 font-semibold">{page}</span> of{" "}
                {totalPages}
              </span>

              <button
                className={`flex items-center gap-1 px-4 py-2 rounded-full border border-gray-700 hover:border-green-400 hover:text-green-400 transition ${
                  page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicMentorListing;
