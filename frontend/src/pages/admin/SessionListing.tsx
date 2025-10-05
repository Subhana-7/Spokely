import { useEffect, useState } from "react";
import DashboardHeader from "../../components/admin/DashboardHeader";
import DataTable from "../../components/admin/DataTables";
import SearchFilterBar from "../../components/admin/SearchFilterBar";
import { adminSessionListing } from "../../services/adminService";

interface SessionItem {
  id: string;
  topic: string;
  type: string;
  status: string;
  mentor: { name: string; email: string };
  participants: { name: string; status: string }[];
  startTime: string;
  endTime?: string;
  feedbackCount?: number;
  flagsCount?: number;
}

const AdminSessionsPage = () => {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchSessions = async () => {
    try {
      const { data } = await adminSessionListing({
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
      });

      setSessions(
        (data.sessions || []).map((s: any) => ({
          id: s._id,
          topic: s.topic,
          type: s.type,
          status: s.status,
          mentor: s.createdBy,
          participants: s.participants || [],
          startTime: s.startTime,
          endTime: s.endTime,
          feedbackCount: s.feedback?.length || 0,
          flagsCount: s.flags?.length || 0,
        }))
      );

      // Ensure total is taken from backend
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Session Management</h2>

        <SearchFilterBar
          searchPlaceholder="Search by topic or mentor"
          onSearch={(val) => {
            setPage(1); // Reset to first page when searching
            setSearchTerm(val);
          }}
          onStatusFilter={(val) => {
            setPage(1); // Reset to first page when changing status
            setStatusFilter(val);
          }}
        />

        <DataTable
          data={sessions.map((s) => ({
            id: s.id,
            topic: s.topic,
            type: s.type,
            status: s.status,
            feedbackCount: s.feedbackCount || 0,
          }))}
          type="session"
          page={page}
          setPage={setPage}
          total={total}
          limit={limit}
          onRowClick={(id) => (window.location.href = `/admin/sessions/${id}`)}
          onDelete={(id) => {
            // TODO: implement delete call
            console.log("delete session", id);
          }}
        />
      </main>
    </div>
  );
};

export default AdminSessionsPage;
