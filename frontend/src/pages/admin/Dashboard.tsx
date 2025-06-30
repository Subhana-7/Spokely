const Dashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="w-20 h-1 bg-blue-500 rounded-full mb-3"></div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to Spokely Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">1,247</p>
          <p className="text-purple-100 text-sm">+12% from last month</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Active Mentors</h3>
          <p className="text-3xl font-bold">89</p>
          <p className="text-yellow-100 text-sm">+5% from last month</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
          <p className="text-3xl font-bold">3,456</p>
          <p className="text-green-100 text-sm">+18% from last month</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold">$24,680</p>
          <p className="text-blue-100 text-sm">+8% from last month</p>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-12">
        <p>Select a management section from the navigation above to get started.</p>
      </div>
    </div>
  );
};

export default Dashboard;
