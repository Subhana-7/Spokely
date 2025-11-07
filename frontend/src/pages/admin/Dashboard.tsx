const Dashboard = () => {
  console.log("just chekin")
  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <div className="w-16 h-1 bg-blue-500 rounded-full mb-3"></div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-gray-600 text-sm md:text-base">Welcome to Spokely Admin Dashboard</p>
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <h3 className="text-base font-semibold mb-1">Total Users</h3>
          <p className="text-2xl font-bold">1,247</p>
          <p className="text-purple-100 text-xs mt-1">+12% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-5 text-white">
          <h3 className="text-base font-semibold mb-1">Active Mentors</h3>
          <p className="text-2xl font-bold">89</p>
          <p className="text-yellow-100 text-xs mt-1">+5% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white">
          <h3 className="text-base font-semibold mb-1">Total Sessions</h3>
          <p className="text-2xl font-bold">3,456</p>
          <p className="text-green-100 text-xs mt-1">+18% from last month</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <h3 className="text-base font-semibold mb-1">Revenue</h3>
          <p className="text-2xl font-bold">$24,680</p>
          <p className="text-blue-100 text-xs mt-1">+8% from last month</p>
        </div>
      </div> */}

      <div className="text-center text-gray-500 text-sm">
        <p>Select a management section from the navigation above to get started.</p>
      </div>
    </div>
  );
};

export default Dashboard;
