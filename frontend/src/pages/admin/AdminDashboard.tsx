import { Outlet } from 'react-router-dom';
import DashboardHeader from '../../components/admin/DashboardHeader';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-teal-700">
      <DashboardHeader />
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-2xl shadow-lg min-h-[calc(100vh-140px)] p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
