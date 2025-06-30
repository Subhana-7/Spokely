import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import SearchFilterBar from '../../components/admin/SearchFilterBar';
import DataTable from '../../components/admin/DataTables';
import { getAllMentors } from '../../services/adminService';

const MentorManagement = () => {
  const [mentors, setMentors] = useState<any[]>([]); // Replace 'any' with a proper type if needed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await getAllMentors();
        setMentors(res); // assuming res is an array of mentors
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleBlock = (id: string) => {
    console.log('Block mentor:', id);
  };

  const handleEdit = (id: string) => {
    console.log('Edit mentor:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete mentor:', id);
  };

  const mentorData = mentors.map(mentor => ({
    id: mentor._id,
    name: mentor.name,
    email: mentor.email,
    students: mentor.studentsCount || 0, // adapt based on your schema
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
