import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import SpokelyCard from "../../components/common/Cards";
import Button from "../../modals/Button";
import Input from "../../modals/Input";
import Badge from "../../components/common/Badge";
import MentorHeader from "../mentor/DashboardComponents/Header";
import { getMentorStudents } from "../../services/subscriptionService";
import { useAuthStore } from "../../store/userAuthStore";
import { useNavigate } from "react-router-dom";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  sessionsAttended: number;
  averageScore: string ;
  level: "Beginner" | "Intermediate" | "Advance";
}

const MyStudents: React.FC = () => {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const mentorId = useAuthStore((state) => state.user?.id!);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await getMentorStudents(mentorId)

        const transformed: Student[] = data.map((item: any) => {
          return {
            id: item.user?._id,
            name: item.user?.name || "Unknown",
            email: item.user?.email || "",
            avatar: item.user?.profilePicture || `https://ui-avatars.com/api/?name=${item.user?.name}`,
            sessionsAttended: item.sessionsCount || 0,
            averageScore: item.avgRating ? `${item.avgRating.toFixed(1)}/5` : "N/A",
            level:
              item.sessionsCount < 10
                ? "Beginner"
                : item.sessionsCount < 20
                ? "Intermediate"
                : "Advance",
          };
        });

        setStudents(transformed);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = students.length;
  const avgScore =
    students.length > 0
      ? (
          students.reduce((acc, s) => acc + (parseFloat(s.averageScore) || 0), 0) /
          students.length
        ).toFixed(1)
      : "N/A";

  const beginnerCount = students.filter((s) => s.level === "Beginner").length;
  const intermediateCount = students.filter((s) => s.level === "Intermediate").length;

  return (
    <div className="min-h-screen bg-slate-700">
      <MentorHeader />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">My Students</h1>
          <p className="text-gray-300">
            Track progress and manage your learners
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SpokelyCard className="bg-slate-800 text-center text-white">
            <p className="text-gray-400">Total Students</p>
            <p className="text-2xl font-bold text-emerald-400">{totalStudents}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center text-white">
            <p className="text-gray-400">Average Score</p>
            <p className="text-2xl font-bold text-emerald-400">{avgScore}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center text-white">
            <p className="text-gray-400">Beginner</p>
            <p className="text-2xl font-bold text-emerald-400">{beginnerCount}</p>
          </SpokelyCard>
          <SpokelyCard className="bg-slate-800 text-center text-white">
            <p className="text-gray-400">Intermediate</p>
            <p className="text-2xl font-bold text-emerald-400">{intermediateCount}</p>
          </SpokelyCard>
        </div>

        {/* Search */}
        <div className="flex flex-wrap gap-4 items-center mb-8">
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder="Search students by id or name..."
              value={search}
              onChange={(val) => setSearch(val)}
              rightIcon={<Search size={18} />}
              className="bg-slate-800 text-white border-gray-600 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Student Cards */}
        {loading ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <SpokelyCard
                  key={student.id}
                  className="bg-white text-gray-900 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold">
                         {student.name}
                      </h3>
                      <Badge variant="mentor" size="sm">
                        {student.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between mb-4">
                    <SpokelyCard className="bg-slate-100 text-center w-full mr-2">
                      <p className="text-gray-500 text-sm">Sessions Attended</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {student.sessionsAttended}
                      </p>
                    </SpokelyCard>
                    <SpokelyCard className="bg-slate-100 text-center w-full ml-2">
                      <p className="text-gray-500 text-sm">Average Score</p>
                      <p className="text-lg font-semibold text-slate-700">
                        {student.averageScore}
                      </p>
                    </SpokelyCard>
                  </div>
                  <Button onClick={() => navigate(`/user-profile/${student.id}`)} variant="primary">View Details</Button>
                </SpokelyCard>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-8 right-8 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg transition hover:scale-110">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default MyStudents;
