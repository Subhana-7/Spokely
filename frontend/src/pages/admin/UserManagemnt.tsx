import { useEffect, useState } from "react";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import DataTable from "../../components/admin/DataTables";
import { getAllUsers, updateUserStatus } from "../../services/adminService";
import toast from "react-hot-toast";

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Levels");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers({
          search,
          level: filter,
          page,
          limit,
          isBlocked:
            statusFilter === "blocked"
              ? true
              : statusFilter === "active"
              ? false
              : undefined,
        });

        setUsers(data.users);
        setTotal(data.total);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, [search, filter, statusFilter, page, limit]); // 👈 Add statusFilter here

  const handleBlock = async (id: string) => {
    try {
      const user = users.find((u) => u.id === id);
      if (!user) {
        toast.error("User not found");
        return;
      }

      const newStatus = user.isBlocked ? "unBlocked" : "blocked";

      await updateUserStatus(id, newStatus);

      setUsers((prev) =>
        prev.map((u) => {
          if (u._id === id) {
            return { ...u, isBlocked: !u.isBlocked };
          }
          return u;
        })
      );

      toast.success(
        `User ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`
      );
    } catch (err) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", err);
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
    status: user.isBlocked ? "Blocked" : "unBlocked",
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
        onSearch={setSearch}
        onFilter={setFilter}
        onStatusFilter={setStatusFilter}
      />

      <DataTable
        data={userData}
        type="user"
        onBlock={handleBlock}
        page={page}
        setPage={setPage}
        total={total}
        limit={limit}
      />
    </div>
  );
};

export default UserManagement;
