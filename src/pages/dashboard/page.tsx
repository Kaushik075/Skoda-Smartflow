import { useAuth } from '../../context/AuthContext';
import { MarketingDashboard } from './components/MarketingDashboard';
import { CRTDashboard } from './components/CRTDashboard';
import { SalesDashboard } from './components/SalesDashboard';
import { AdminDashboard } from './components/AdminDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const renderDashboard = () => {
    switch (user.role) {
      case 'Marketing Team':
        return <MarketingDashboard />;
      case 'CRT':
        return <CRTDashboard />;
      case 'Sales Executive':
        return <SalesDashboard />;
      case 'IT Admin':
        return <AdminDashboard />;
      default:
        return <div>Dashboard not available for this role</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-[#006E5B] mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-600">
          {user.role} Dashboard - Mahavir Skoda Sales Automation System
        </p>
      </div>
      
      {renderDashboard()}
    </div>
  );
}