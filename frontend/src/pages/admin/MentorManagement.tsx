import { useEffect, useState } from "react";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import DataTable from "../../components/admin/DataTables";
import { getAllMentors, updateMentorStatus } from "../../services/adminService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const MentorManagement = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await getAllMentors();
        setMentors(res);
      } catch (err) {
        console.error("Error fetching mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      const mentor = mentors.find(m => m._id === id);
      if (!mentor) {
        toast.error("Mentor not found");
        return;
      }

      const newStatus = mentor.isBlocked ? "unBlocked" : "blocked";
      
      await updateMentorStatus(id, newStatus);

      setMentors((prev) =>
        prev.map((m) => {
          if (m._id === id) {
            return { ...m, isBlocked: !m.isBlocked };
          }
          return m;
        })
      );

      toast.success(`Mentor ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`);
    } catch (err) {
      toast.error("Failed to update mentor status");
      console.error("Error updating mentor status:", err);
    }
  };

  const handleMentorClick = (id: string) => {
      navigate(`/admin/mentors/verification/${id}`);
  };

  const mentorData = mentors.map((mentor) => ({
    id: mentor._id,
    name: mentor.name,
    email: mentor.email,
    students: mentor.studentsCount || 0,
    status: mentor.isBlocked ? "Blocked" : "Active",
    sessions: mentor.sessionsDone || 0,
    avatar: mentor.profilePicture || undefined,
    verificationStatus: mentor.document?.verificationStatus ?? "old doc",
    isBlocked: mentor.isBlocked, 
  }));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="w-16 h-1 bg-yellow-500 rounded-full mb-2"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Mentor Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage and monitor all platform mentors
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search mentors by name or email"
        filterOptions={[
          "All Mentors",
          "Top Rated",
          "Most Students",
          "New Mentors",
        ]}
      />

      <DataTable
        data={mentorData}
        type="mentor"
        onBlock={handleBlock}
        onRowClick={handleMentorClick}
      />
    </div>
  );
};

export default MentorManagement;