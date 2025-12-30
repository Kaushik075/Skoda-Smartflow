
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://www.skoda-storyboard.com/direct-download/2023/12/Skoda_Corporate_Logo_RGB_Emerald_on_Electric_Green_efdf74e3-1920x1449.png"
              alt="Skoda Logo"
              className="h-8 md:h-10 w-auto"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-[#006E5B]">Mahavir Skoda</h1>
              <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Sales Automation System</p>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#006E5B] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm md:text-base font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Logout"
                >
                  <i className="ri-logout-box-line text-lg md:text-xl"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}