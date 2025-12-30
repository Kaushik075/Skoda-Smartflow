
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Hide sidebar on login page
  const isLoginPage = location.pathname === '/login' || location.pathname === '/';
  
  // For IT Admin, only show dashboard - no sidebar
  const isITAdmin = user?.role === 'IT Admin';
  
  // Don't show sidebar if it's login page or IT Admin
  const showSidebar = !isLoginPage && !isITAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        {showSidebar && (
          <div className="w-64 fixed inset-y-0 left-0 z-50">
            <Sidebar />
          </div>
        )}
        
        <div className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
          {!isLoginPage && <Header />}
          <main className={`${!isLoginPage ? 'pt-16' : ''}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {!isLoginPage && <Header />}
        <main className={`${!isLoginPage ? 'pt-16 pb-20' : ''}`}>
          {children}
        </main>
        
        {/* Mobile Bottom Navigation - only show if not login page and not IT Admin */}
        {showSidebar && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around py-2">
              <a href="/dashboard" className="flex flex-col items-center py-2 px-3 text-[#006E5B]">
                <i className="ri-dashboard-line text-xl mb-1"></i>
                <span className="text-xs">Dashboard</span>
              </a>
              <a href="/leads" className="flex flex-col items-center py-2 px-3 text-gray-600">
                <i className="ri-user-line text-xl mb-1"></i>
                <span className="text-xs">Leads</span>
              </a>
              <a href="/schedule" className="flex flex-col items-center py-2 px-3 text-gray-600">
                <i className="ri-calendar-line text-xl mb-1"></i>
                <span className="text-xs">Schedule</span>
              </a>
              <a href="/reports" className="flex flex-col items-center py-2 px-3 text-gray-600">
                <i className="ri-bar-chart-line text-xl mb-1"></i>
                <span className="text-xs">Reports</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
