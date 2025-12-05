import DashboardHeader from "../../components/admin/DashboardHeader";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <DashboardHeader />

      {/* Layout wrapper */}
      <div className="p-4 md:p-8">
        <div className="bg-white/5 rounded-2xl shadow-lg backdrop-blur-lg p-6 md:p-8">
          {/* Child pages render here */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
