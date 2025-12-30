
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarItem {
  icon: string;
  label: string;
  path: string;
  roles: string[];
}

const sidebarItems: SidebarItem[] = [
  { icon: 'ri-dashboard-line', label: 'Dashboard', path: '/dashboard', roles: ['Marketing Team', 'CRT', 'Sales Executive'] },
  { icon: 'ri-user-add-line', label: 'Leads', path: '/leads', roles: ['Marketing Team', 'CRT', 'Sales Executive'] },
  { icon: 'ri-calendar-line', label: 'Schedule', path: '/schedule', roles: ['Sales Executive'] },
  { icon: 'ri-phone-line', label: 'Calls', path: '/calls', roles: ['Sales Executive'] },
];

export function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || user.role === 'IT Admin') return null;

  const filteredItems = sidebarItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-[#006E5B] text-white min-h-screen">
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'bg-[#00FFAA] text-black'
                    : 'hover:bg-[#005A4A]'
                }`}
              >
                <i className={`${item.icon} text-lg mr-3`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-[#006E5B] border-t border-[#005A4A] px-2 py-2">
        <div className="flex justify-around items-center">
          {filteredItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors duration-200 min-w-0 flex-1 mx-1 ${
                location.pathname === item.path
                  ? 'bg-[#00FFAA] text-black'
                  : 'text-white hover:bg-[#005A4A]'
              }`}
            >
              <i className={`${item.icon} text-xl mb-1`}></i>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}