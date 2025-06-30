import { NavLink } from 'react-router-dom';

const DashboardHeader = () => {
  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Mentor Management', path: '/admin/mentors' },
    { label: 'Levels', path: '/admin/levels' },
    { label: 'Tasks', path: '/admin/tasks' },
    { label: 'Reports', path: '/admin/reports' },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-800">Spokely Admin</h1>

            {/* Navigation */}
            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            className="px-4 py-2 border border-red-300 text-red-600 rounded-md font-medium text-sm hover:bg-red-50 hover:border-red-400 transition-colors duration-200"
            onClick={() => {
              // Add logout logic here
              console.log('Logged out');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
