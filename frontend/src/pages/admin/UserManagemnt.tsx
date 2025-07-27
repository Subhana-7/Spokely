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
      setUsers((prev) =>
      prev.map((u) =>
        u._id === id ? { ...u, isBlocked: !u.isBlocked } : u
      )
    );

    toast.success("User " + (users.find(u => u._id === id)?.isBlocked ? "unblocked" : "blocked"));
    } catch (err) {
      toast.error("Failed to block user");
    }
  };

  // const handleEdit = (id: string) => console.log("Edit user:", id);

  // const handleDelete = async (id: string) => {
  //   try {
  //     await deleteUser(id);
  //     toast.success("User deleted");
  //     setUsers((prev) => prev.filter((u) => u._id !== id));
  //   } catch (err) {
  //     toast.error("Failed to delete user");
  //   }
  // };

  const userData = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.profilePicture || undefined,
    level: user.levels?.toString() ?? "N/A",
    students: user.students?.length ?? 0,
    dailyTask: "To be implemented",
    status: user.isBlocked ? "Blocked" : "Active",
    isBlocked:user.isBlocked,
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
        {/* <button
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          onClick={() => console.log("Add User")}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button> */}
      </div>

      <SearchFilterBar
        searchPlaceholder="Search users by name or email"
        filterOptions={["All Levels", "Beginner", "Intermediate", "Advanced"]}
      />

      <DataTable
        data={userData}
        type="user"
        onBlock={handleBlock}
        // onEdit={handleEdit}
        // onDelete={handleDelete}
      />
    </div>
  );
};

export default UserManagement;
