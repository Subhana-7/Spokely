import { Outlet } from 'react-router-dom';
import DashboardHeader from '../../components/common/admin/DashboardHeader';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#3F5F5B' }}>
      <DashboardHeader />
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg min-h-[calc(100vh-140px)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
