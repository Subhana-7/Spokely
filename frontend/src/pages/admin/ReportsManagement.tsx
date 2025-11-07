import { useEffect, useState } from "react";
import axios from "axios";
import SpokelyCard from "../../components/common/Cards";
import DataTable from "../../components/admin/DataTables";
import Button from "../../modals/Button";

interface StatItem {
  title: string;
  value: string | number;
}

const Reports = () => {
  const [reportType, setReportType] = useState<
    "user" | "mentor" | "session" | "dailyTask" | "payment"
  >("user");

  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("Daily");

  const [page, setPage] = useState(1);
  const limit = 5;

  // ✅ Fetch data dynamically
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/admin/reports?type=${reportType}`
      );
      setData(res.data.data || []);
      setStats(generateStats(reportType, res.data.data || []));
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  console.log(data)

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange]);

  // ✅ Dynamic Stats Generator
  const generateStats = (type: string, dataset: any[]): StatItem[] => {
    switch (type) {
      case "user":
        const blockedUsers = dataset.filter((u) => u.isBlocked).length;
        return [
          { title: "Total Users", value: dataset.length },
          { title: "Active Users", value: dataset.length - blockedUsers },
          { title: "Blocked Users", value: blockedUsers },
        ];
      case "mentor":
        const blockedMentors = dataset.filter((m) => m.isBlocked).length;
        const approved = dataset.filter(
          (m) => m.verificationStatus === "approved"
        ).length;
        return [
          { title: "Total Mentors", value: dataset.length },
          { title: "Approved", value: approved },
          { title: "Blocked", value: blockedMentors },
        ];
      case "session":
        const completed = dataset.filter((s) => s.status === "completed").length;
        return [
          { title: "Total Sessions", value: dataset.length },
          { title: "Completed", value: completed },
          { title: "Pending", value: dataset.length - completed },
        ];
      case "dailyTask":
        return [
          { title: "Total Tasks", value: dataset.length },
          { title: "Sample Completion", value: `${Math.floor(Math.random() * 100)}%` },
        ];
      case "payment":
        const totalAmt = dataset.reduce((sum, p) => sum + (p.amount || 0), 0);
        const completedPayments = dataset.filter(
          (p) => p.status === "completed"
        ).length;
        return [
          { title: "Total Payments", value: dataset.length },
          { title: "Completed Payments", value: completedPayments },
          { title: "Total Revenue", value: `₹${totalAmt}` },
        ];
      default:
        return [];
    }
  };

  // ✅ Handlers
  const handleReportTypeChange = (
    type: "user" | "mentor" | "session" | "dailyTask" | "payment"
  ) => {
    setReportType(type);
    setPage(1);
    setSearch("");
    setFilter("All");
    setStatusFilter("all");
  };

  const handleExportExcel = async () => {
    try {
      const res = await axios.get(`/api/admin/reports?type=${reportType}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Excel export failed", error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get(`/api/admin/reports?type=${reportType}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType}-report.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("PDF export failed", error);
    }
  };

  // ✅ Render
  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="w-16 h-1 bg-purple-600 rounded-full mb-2"></div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Analytics & Reports
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          View reports by users, mentors, sessions, daily tasks, or payments
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3">
          {["user", "mentor", "session", "dailyTask", "payment"].map((type) => (
            <button
              key={type}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all ${
                reportType === type
                  ? "border-purple-500 bg-purple-100 text-purple-800"
                  : "border-gray-300 text-white hover:bg-gray-100"
              }`}
              onClick={() =>
                handleReportTypeChange(type as typeof reportType)
              }
            >
              {type === "dailyTask"
                ? "✅ Daily Tasks"
                : type === "session"
                ? "📅 Sessions"
                : type === "mentor"
                ? "👨‍🏫 Mentors"
                : type === "payment"
                ? "💳 Payments"
                : "📊 Users"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <SpokelyCard key={s.title} className="text-center">
              <h2 className="text-2xl font-bold text-purple-700">{s.value}</h2>
              <p className="text-sm text-gray-600">{s.title}</p>
            </SpokelyCard>
          ))}
        </div>
      )}

      {/* Filters & Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder={`Search ${reportType}...`}
            className="border rounded-lg px-3 py-2 text-sm w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Custom</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            📊 Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            📄 PDF
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <DataTable
          data={data}
           type={(reportType === "dailyTask" ? "user" : reportType) as "user" | "mentor" | "session"}
          page={page}
          setPage={setPage}
          total={data.length}
          limit={limit}
          onRowClick={(id) => console.log("View", id)}
          onDelete={(id) => console.log("Delete", id)}
          onBlock={(id) => console.log("Block", id)}
        />
      )}
    </div>
  );
};

export default Reports;
