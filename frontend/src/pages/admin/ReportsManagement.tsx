import { useEffect, useState } from "react";
import SpokelyCard from "../../components/common/Cards";
import DataTable from "../../components/admin/DataTables";
import Button from "../../modals/Button";
import { exportPdf, getReports } from "../../services/adminService";

interface StatItem {
  title: string;
  value: string | number;
}

const Reports = () => {
  const [reportType, setReportType] = useState<
    "user" | "mentor" | "session" | "dailyTask" | "payment"
  >("user");

  const [data, setData] = useState<any[]>([]);
  const [stats, _setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [_filter, setFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("Daily");
  const [total,setTotal] = useState(0)

  const [page, setPage] = useState(1);
  const limit = 5;

  const fetchReports = async () => {
  try {
    setLoading(true);

    const res = await getReports({
      type: reportType,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    });

    const list = res.data?.data || [];

    const normalized = list.map((item: any) =>
      normalizeReportItem(item, reportType)
    );

    const start = (page - 1) * limit;
    const end = start + limit;

    setData(normalized.slice(start, end)); 
    setTotal(normalized.length); 

  } catch (err) {
    console.error("Error fetching reports:", err);
  } finally {
    setLoading(false);
  }
};


  console.log(data);

  useEffect(() => {
    fetchReports();
  }, [reportType, dateRange, search, statusFilter, page]);

  const handleExportPDF = async () => {
    try {
      const res = await exportPdf({
        type: reportType,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${reportType}-report.pdf`;
      link.click();
      link.remove();
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  const normalizeReportItem = (item: any, type: string) => {
    switch (type) {
      case "mentor":
        return {
          id: item._id ?? item.id,
          name: item.name,
          email: item.email,
          sessions: item.sessionsDone ?? item.sessions ?? 0,
          students: item.studentsCount ?? item.students ?? 0,
          verificationStatus:
            item.document?.verificationStatus ?? item.verificationStatus,
          isBlocked: item.isBlocked,
        };

      case "user":
        return {
          id: item._id ?? item.id,
          name: item.name ?? "-",
          email: item.email ?? "-",
          level: item.level ?? item.levels ?? "-",
          levels: item.levels ?? item.level ?? "-",
          sessions:
            item.sessionsDone ?? item.sessions ?? item.sessionCount ?? 0,
          sessionsDone:
            item.sessionsDone ?? item.sessions ?? item.sessionCount ?? 0,
          isBlocked: item.isBlocked ?? false,
        };

      case "session":
        return {
          id: item._id ?? item.id,
          topic: item.topic,
          type: item.type,
          status: item.status,
          feedbackCount: item.feedbackCount ?? 0,
        };

      case "dailyTask":
        return {
          id: item._id ?? item.id,
          dailyTask: item.topic ?? item.title,
          status: item.status,
          user: {
            name: item.user?.name ?? "-",
            email: item.user?.email ?? "-",
          },
        };

      case "payment":
        return {
          id: item._id ?? item.id,
          paypalOrderId: item.paypalOrderId,
          amount: item.amount,
          currency: item.currency,
          status: item.status,
        };

      default:
        return item;
    }
  };

  // const generateStats = (type: string, dataset: any[]): StatItem[] => {
  //   switch (type) {
  //     case "user":
  //       const blockedUsers = dataset.filter((u) => u.isBlocked).length;
  //       return [
  //         { title: "Total Users", value: dataset.length },
  //         { title: "Active Users", value: dataset.length - blockedUsers },
  //         { title: "Blocked Users", value: blockedUsers },
  //       ];
  //     case "mentor":
  //       const blockedMentors = dataset.filter((m) => m.isBlocked).length;
  //       const approved = dataset.filter(
  //         (m) => m.verificationStatus === "approved"
  //       ).length;
  //       return [
  //         { title: "Total Mentors", value: dataset.length },
  //         { title: "Approved", value: approved },
  //         { title: "Blocked", value: blockedMentors },
  //       ];
  //     case "session":
  //       const completed = dataset.filter(
  //         (s) => s.status === "completed"
  //       ).length;
  //       return [
  //         { title: "Total Sessions", value: dataset.length },
  //         { title: "Completed", value: completed },
  //         { title: "Pending", value: dataset.length - completed },
  //       ];
  //     case "dailyTask":
  //       return [
  //         { title: "Total Tasks", value: dataset.length },
  //         {
  //           title: "Sample Completion",
  //           value: `${Math.floor(Math.random() * 100)}%`,
  //         },
  //       ];
  //     case "payment":
  //       const totalAmt = dataset.reduce((sum, p) => sum + (p.amount || 0), 0);
  //       const completedPayments = dataset.filter(
  //         (p) => p.status === "completed"
  //       ).length;
  //       return [
  //         { title: "Total Payments", value: dataset.length },
  //         { title: "Completed Payments", value: completedPayments },
  //         { title: "Total Revenue", value: `₹${totalAmt}` },
  //       ];
  //     default:
  //       return [];
  //   }
  // };

  const handleReportTypeChange = (
    type: "user" | "mentor" | "session" | "dailyTask" | "payment"
  ) => {
    setReportType(type);
    setPage(1);
    setSearch("");
    setFilter("All");
    setStatusFilter("all");
  };

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
              onClick={() => handleReportTypeChange(type as typeof reportType)}
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
            onClick={handleExportPDF}
            className="bg-red-600 text-white hover:bg-red-700 p-5"
          >
            📄Download PDF
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : (
        <DataTable
          data={data}
          type={
            reportType as
              | "user"
              | "mentor"
              | "session"
              | "dailyTask"
              | "payment"
          }
          page={page}
          setPage={setPage}
           total={total} 
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
