import { useState, useEffect } from 'react';
import { Alert, ExecutiveStats } from '../../types';
import { AlertCard } from './AlertCard';
import { db } from '../../services/database';
import { wsService } from '../../services/websocket';

interface AlertsPanelProps {
  currentUserId: string;
  userRole: string;
}

export function AlertsPanel({ currentUserId, userRole }: AlertsPanelProps) {
  const [myAlerts, setMyAlerts] = useState<Alert[]>([]);
  const [teamAlerts, setTeamAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<ExecutiveStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    loadStats();
    
    // Set up WebSocket listeners for real-time updates
    wsService.on('new_alert', handleNewAlert);
    wsService.on('claim_update', handleClaimUpdate);
    wsService.on('alert_update', loadAlerts);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    
    return () => {
      wsService.off('new_alert', handleNewAlert);
      wsService.off('claim_update', handleClaimUpdate);
      wsService.off('alert_update', loadAlerts);
      clearInterval(interval);
    };
  }, [currentUserId]);

  const loadAlerts = async () => {
    try {
      const alerts = await db.getTodayAlerts();
      
      // Filter alerts for current user (claimed by them or unclaimed)
      const myAlertsFiltered = alerts.filter(alert => 
        alert.claimed_by === currentUserId || alert.claim_status === 'unclaimed'
      );
      
      // Team alerts are unclaimed alerts
      const teamAlertsFiltered = alerts.filter(alert => 
        alert.claim_status === 'unclaimed'
      );
      
      setMyAlerts(myAlertsFiltered);
      setTeamAlerts(teamAlertsFiltered);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (userRole === 'Sales Executive') {
      try {
        const statsData = await db.getExecutiveStats(currentUserId);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }
  };

  const handleClaimAlert = async (scheduleId: string): Promise<boolean> => {
    try {
      const success = await db.claimAlert(scheduleId, currentUserId);
      if (success) {
        // Broadcast claim update via WebSocket
        wsService.broadcastClaimUpdate(scheduleId, currentUserId);
        await loadAlerts();
        await loadStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to claim alert:', error);
      return false;
    }
  };

  const handleNewAlert = (data: any) => {
    loadAlerts();
  };

  const handleClaimUpdate = (data: any) => {
    loadAlerts();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <i className="ri-loader-4-line text-2xl text-[#006E5B] animate-spin"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats for Sales Executives */}
      {userRole === 'Sales Executive' && stats && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-[#006E5B] mb-3">Today's Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#006E5B]">{stats.claimed_count}</div>
              <div className="text-sm text-gray-600">Claimed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed_count}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.success_rate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* My Alerts Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#006E5B]">
            My Alerts
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00FFAA] text-black">
              {myAlerts.filter(a => a.claimed_by === currentUserId).length} claimed
            </span>
          </h2>
          <button
            onClick={loadAlerts}
            className="p-2 text-gray-500 hover:text-[#006E5B] transition-colors"
          >
            <i className="ri-refresh-line text-lg"></i>
          </button>
        </div>

        <div className="space-y-4">
          {myAlerts.length > 0 ? (
            myAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onClaim={handleClaimAlert}
                currentUserId={currentUserId}
                showClaimButton={alert.claim_status === 'unclaimed'}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <i className="ri-notification-off-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">No alerts assigned to you today</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Alerts Section */}
      {userRole === 'Sales Executive' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#006E5B]">
              Team Alerts
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {teamAlerts.length} unclaimed
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {teamAlerts.length > 0 ? (
              teamAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onClaim={handleClaimAlert}
                  currentUserId={currentUserId}
                  showClaimButton={true}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <i className="ri-team-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No unclaimed team alerts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}