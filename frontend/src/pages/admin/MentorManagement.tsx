import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import SearchFilterBar from '../../components/common/admin/SearchFilterBar';
import DataTable from '../../components/common/admin/DataTables';
import { getAllMentors,blockMentor,deleteMentor } from '../../services/adminService';
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

  const handleEdit = (id: string) => {
    console.log('Edit mentor:', id);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMentor(id);
      toast.success("User deleted");
      setMentors((prev) => prev.filter((mentor) => mentor._id !== id));
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  const mentorData = mentors.map(mentor => ({
    id: mentor._id,
    name: mentor.name,
    email: mentor.email,
    students: mentor.studentsCount || 0,
    status: mentor.isBlocked ? 'Blocked' : 'Active',
    sessions: mentor.sessionsDone || 0,
    avatar: mentor.profilePicture || undefined,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="w-20 h-1 bg-yellow-500 rounded-full mb-3"></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mentor Management</h1>
          <p className="text-gray-600">Manage and monitor all platform mentors</p>
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors duration-200"
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default MentorManagement;
