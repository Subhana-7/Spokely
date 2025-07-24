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
      <div className="px-4 md:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="w-full flex flex-col lg:flex-row lg:items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Spokely Admin</h1>
          <nav className="flex flex-wrap gap-2 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
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

        <button
          type="button"
          className="self-end lg:self-auto px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 hover:border-red-400 transition"
          onClick={() => {
            console.log('Logged out');
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
