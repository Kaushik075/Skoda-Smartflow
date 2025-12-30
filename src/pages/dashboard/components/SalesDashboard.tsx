
import { useState, useEffect } from 'react';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { Select } from '../../../components/base/Select';
import { Textarea } from '../../../components/base/Textarea';
import { Calendar } from '../../../components/feature/Calendar';
import { AlertsPanel } from '../../../components/feature/AlertsPanel';
import { db } from '../../../services/database';
import { aiService } from '../../../services/ai';
import { wsService } from '../../../services/websocket';
import { Schedule, Call, Lead } from '../../../types';

export function SalesDashboard() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [followUpScript, setFollowUpScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  
  const [callData, setCallData] = useState({
    lead_id: '',
    date_time: '',
    outcome: '',
    feedback: '',
    vehicle: ''
  });

  useEffect(() => {
    loadDashboardData();
    
    // Connect to WebSocket for real-time updates
    wsService.connect();
    
    // Release expired claims every minute
    const claimCleanup = setInterval(() => {
      db.releaseExpiredClaims();
    }, 60000);
    
    return () => {
      wsService.disconnect();
      clearInterval(claimCleanup);
    };
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [schedulesData, callsData, leadsData] = await Promise.all([
        db.getSchedules('3'), // Sales Executive ID
        db.getCalls(),
        db.getLeads()
      ]);
      
      setSchedules(schedulesData);
      setCalls(callsData);
      setLeads(leadsData.filter(lead => lead.status === 'Assigned to Sales'));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await db.createCall({
        ...callData,
        executive_id: '3'
      });
      
      // Update lead status based on outcome
      if (callData.outcome === 'Test Drive Scheduled') {
        await db.updateLead(callData.lead_id, { status: 'Test Drive' });
      } else if (callData.outcome === 'Not Interested') {
        await db.updateLead(callData.lead_id, { status: 'Not Interested' });
      }
      
      setCallData({
        lead_id: '',
        date_time: '',
        outcome: '',
        feedback: '',
        vehicle: ''
      });
      setShowCallForm(false);
      loadDashboardData();
    } catch (error) {
      console.error('Failed to log call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFollowUpScript = async (feedback: string) => {
    setIsGeneratingScript(true);
    try {
      const script = await aiService.generateFollowUpScript(feedback);
      setFollowUpScript(script);
    } catch (error) {
      console.error('Failed to generate script:', error);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleEventCreate = (event: Schedule) => {
    // Broadcast new alert via WebSocket
    wsService.broadcastNewAlert({
      schedule_id: event.id,
      customer_name: event.customer_name,
      vehicle: event.vehicle_interest,
      scheduled_time: `${event.date} ${event.time}`
    });
    
    loadDashboardData();
  };

  const todaySchedules = schedules.filter(schedule => 
    schedule.date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="space-y-6">
      {/* Mobile-Optimized Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#006E5B] rounded-lg flex items-center justify-center">
              <i className="ri-calendar-line text-white text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Today's Schedule</p>
              <p className="text-xl font-bold text-[#006E5B]">{todaySchedules.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#00FFAA] rounded-lg flex items-center justify-center">
              <i className="ri-phone-line text-black text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Calls Made</p>
              <p className="text-xl font-bold text-[#006E5B]">{calls.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-car-line text-white text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Test Drives</p>
              <p className="text-xl font-bold text-[#006E5B]">
                {calls.filter(c => c.outcome === 'Test Drive Scheduled').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="ri-user-heart-line text-white text-lg"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-600">Interested</p>
              <p className="text-xl font-bold text-[#006E5B]">
                {calls.filter(c => c.outcome === 'Interested').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Alerts Panel */}
      <AlertsPanel currentUserId="3" userRole="Sales Executive" />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setShowCallForm(!showCallForm)}
          size="sm"
        >
          <i className="ri-phone-line mr-2"></i>
          Log Call
        </Button>
        
        <Button
          onClick={() => setShowCalendar(!showCalendar)}
          variant="secondary"
          size="sm"
        >
          <i className="ri-calendar-line mr-2"></i>
          {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
        </Button>
      </div>

      {/* Calendar Component */}
      {showCalendar && (
        <Calendar 
          executiveId="3" 
          onEventCreate={handleEventCreate}
        />
      )}

      {/* Call Logging Form */}
      {showCallForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#006E5B] mb-6">Log Call/Visit</h2>
          
          <form onSubmit={handleCallSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Customer"
                value={callData.lead_id}
                onChange={(e) => setCallData({...callData, lead_id: e.target.value})}
                required
              >
                <option value="">Select Customer</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.vehicle_interest}
                  </option>
                ))}
              </Select>
              
              <Input
                label="Date & Time"
                type="datetime-local"
                value={callData.date_time}
                onChange={(e) => setCallData({...callData, date_time: e.target.value})}
                required
              />
              
              <Select
                label="Outcome"
                value={callData.outcome}
                onChange={(e) => setCallData({...callData, outcome: e.target.value})}
                required
              >
                <option value="">Select Outcome</option>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Test Drive Scheduled">Test Drive Scheduled</option>
              </Select>
              
              <Input
                label="Vehicle Discussed"
                value={callData.vehicle}
                onChange={(e) => setCallData({...callData, vehicle: e.target.value})}
                placeholder="e.g., Kushaq, Slavia"
                required
              />
            </div>
            
            <Textarea
              label="Feedback & Notes"
              value={callData.feedback}
              onChange={(e) => setCallData({...callData, feedback: e.target.value})}
              placeholder="Customer feedback, concerns, next steps..."
              rows={4}
              required
            />
            
            <div className="flex space-x-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Logging Call...' : 'Log Call'}
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                onClick={() => generateFollowUpScript(callData.feedback)}
                disabled={!callData.feedback || isGeneratingScript}
              >
                {isGeneratingScript ? 'Generating...' : 'Generate AI Script'}
              </Button>
            </div>
          </form>
          
          {followUpScript && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">AI Generated Follow-up Script:</h4>
              <pre className="text-blue-800 text-sm whitespace-pre-wrap">{followUpScript}</pre>
            </div>
          )}
        </div>
      )}

      {/* Recent Calls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#006E5B] mb-6">Recent Calls</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Outcome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {calls.slice(0, 10).map((call) => {
                const lead = leads.find(l => l.id === call.lead_id);
                return (
                  <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {lead?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(call.date_time).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">{call.vehicle}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        call.outcome === 'Interested' ? 'bg-green-100 text-green-800' :
                        call.outcome === 'Test Drive Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {call.outcome}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                      {call.feedback}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
