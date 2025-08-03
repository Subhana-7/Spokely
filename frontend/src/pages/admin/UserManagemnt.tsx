import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import DataTable from "../../components/admin/DataTables";
import { getAllUsers, blockUser } from "../../services/adminService";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);

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

      let newStatus = "";
      setUsers((prev) => {
        const updatedUsers = prev.map((u) => {
          // FIX: Use the same ID field that you're passing from userData
          if (u._id === id) {
            const updatedUser = { ...u, isBlocked: !u.isBlocked };
            newStatus = updatedUser.isBlocked ? "blocked" : "unblocked";
            return updatedUser;
          }
          return u;
        });
        return updatedUsers;
      });

      toast.success("User Blocked" + newStatus);
    } catch (err) {
      toast.error("Failed to block user");
    }
  };

  const userData = users.map((user) => ({
    id: user.id, 
    name: user.name,
    email: user.email,
    avatar: user.profilePicture || undefined,
    level: user.levels?.toString() ?? "N/A",
    students: user.students?.length ?? 0,
    dailyTask: "To be implemented",
    status: user.isBlocked ? "Blocked" : "Active",
    isBlocked: user.isBlocked,
    sessions: user.sessionsDone,
    mentors: 0,
  }));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="w-16 h-1 bg-purple-500 rounded-full mb-2"></div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            User Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage and monitor all platform users
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchPlaceholder="Search users by name or email"
        filterOptions={["All Levels", "Beginner", "Intermediate", "Advanced"]}
      />

      <DataTable
        data={userData}
        type="user"
        onBlock={handleBlock}
      />
    </div>
  );
};

export default UserManagement;