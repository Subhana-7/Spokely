import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import DataTable from '../../components/admin/DataTables';
import { getAllMentors, blockMentor } from '../../services/adminService';
import toast from 'react-hot-toast';

const MentorManagement = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await getAllMentors();
        setMentors(res);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      await blockMentor(id);
      toast.success("User blocked");
      setMentors((prev) =>
        prev.map((mentor) =>
          mentor._id === id ? { ...mentor, isBlocked: !mentor.isBlocked } : mentor
        )
      );
    } catch (err) {
      toast.error("Failed to block user");
    }
  };

  // const handleEdit = (id: string) => console.log('Edit mentor:', id);

  // const handleDelete = async (id: string) => {
  //   try {
  //     await deleteMentor(id);
  //     toast.success("User deleted");
  //     setMentors((prev) => prev.filter((mentor) => mentor._id !== id));
  //   } catch (err) {
  //     toast.error("Failed to delete user");
  //   }
  // };

  const mentorData = mentors.map((mentor) => ({
    id: mentor._id,
    name: mentor.name,
    email: mentor.email,
    students: mentor.studentsCount || 0,
    status: mentor.isBlocked ? 'Blocked' : 'Active',
    sessions: mentor.sessionsDone || 0,
    avatar: mentor.profilePicture || undefined,
  }));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="w-16 h-1 bg-yellow-500 rounded-full mb-2"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mentor Management</h1>
          <p className="text-sm text-gray-600">Manage and monitor all platform mentors</p>
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          onClick={() => console.log('Add Mentor')}
        >
          <Plus className="w-4 h-4" />
          Add Mentor
        </button>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search mentors by name or email"
        filterOptions={["All Mentors", "Top Rated", "Most Students", "New Mentors"]}
      />

      <DataTable
        data={mentorData}
        type="mentor"
        onBlock={handleBlock}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
      />
    </div>
  );
};

export default MentorManagement;
