import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SearchFilterBar from "../../components/common/admin/SearchFilterBar";
import DataTable from "../../components/common/admin/DataTables";
import {
  getAllUsers,
  blockUser,
  deleteUser,
} from "../../services/adminService";
import toast from "react-hot-toast";

interface IUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  levels?: number;
  sessionsDone: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<IUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      await blockUser(id);
      toast.success("User blocked");
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, isBlocked: true } : u))
      );
    } catch (err) {
      toast.error("Failed to block user");
    }
  };

  const handleEdit = (id: string) => console.log("Edit user:", id);
  
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="w-20 h-1 bg-purple-500 rounded-full mb-3"></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          onClick={() => console.log("Add User")}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search users by name or email"
        filterOptions={["All Levels", "Beginner", "Intermediate", "Advanced"]}
      />

      <DataTable
        data={users.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.levels?.toString() ?? "N/A",
          dailyTask: "To be implemented",
          sessions: user.sessionsDone,
          mentors: 0,
          avatar: user.profilePicture || undefined,
        }))}
        type="user"
        onBlock={handleBlock}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UserManagement;
