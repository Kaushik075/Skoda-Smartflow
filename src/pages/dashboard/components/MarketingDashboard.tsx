
import { useState, useEffect } from 'react';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { Select } from '../../../components/base/Select';
import { Textarea } from '../../../components/base/Textarea';
import { Calendar } from '../../../components/feature/Calendar';
import { db } from '../../../services/database';
import { wsService } from '../../../services/websocket';
import { Lead, Schedule } from '../../../types';

export function MarketingDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');

  const [leadData, setLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_interest: '',
    source_event: '',
    notes: ''
  });

  useEffect(() => {
    loadLeads();
    wsService.connect();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await db.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await db.createLead({
        ...leadData,
        vehicle_interest: leadData.vehicle_interest as any,
        status: 'New'
      });
      
      setLeadData({
        name: '',
        phone: '',
        email: '',
        vehicle_interest: '',
        source_event: '',
        notes: ''
      });
      setShowLeadForm(false);
      loadLeads();
    } catch (error) {
      console.error('Failed to create lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handoverToCRT = async (leadId: string) => {
    try {
      await db.updateLead(leadId, {
        status: 'Assigned to CRT',
        assigned_to: '2' // CRT user ID
      });
      loadLeads();
    } catch (error) {
      console.error('Failed to handover lead:', error);
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
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = !filterVehicle || lead.vehicle_interest === filterVehicle;
    return matchesSearch && matchesVehicle;
  });

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button
          onClick={() => setShowLeadForm(!showLeadForm)}
          size="sm"
        >
          <i className="ri-add-line mr-2"></i>
          Add New Lead
        </Button>
        
        <Button
          onClick={() => setShowCalendar(!showCalendar)}
          variant="secondary"
          size="sm"
        >
          <i className="ri-calendar-line mr-2"></i>
          {showCalendar ? 'Hide Calendar' : 'Schedule Follow-up'}
        </Button>
      </div>

      {/* Calendar Component */}
      {showCalendar && (
        <Calendar 
          executiveId="1" 
          onEventCreate={handleEventCreate}
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#006E5B] rounded-lg flex items-center justify-center">
              <i className="ri-user-add-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-[#006E5B]">{leads.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#00FFAA] rounded-lg flex items-center justify-center">
              <i className="ri-arrow-right-line text-black text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Handed to CRT</p>
              <p className="text-2xl font-bold text-[#006E5B]">
                {leads.filter(l => l.status === 'Assigned to CRT').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-car-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Most Interest</p>
              <p className="text-lg font-bold text-[#006E5B]">Kushaq</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#006E5B]">Lead Capture</h2>
          <Button onClick={() => setShowLeadForm(!showLeadForm)}>
            <i className="ri-add-line mr-2"></i>
            {showLeadForm ? 'Cancel' : 'Add New Lead'}
          </Button>
        </div>

        {showLeadForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              value={leadData.name}
              onChange={(e) => setLeadData({...leadData, name: e.target.value})}
              required
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={leadData.phone}
              onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={leadData.email}
              onChange={(e) => setLeadData({...leadData, email: e.target.value})}
              required
            />
            
            <Select
              label="Interested Vehicle"
              value={leadData.vehicle_interest}
              onChange={(e) => setLeadData({...leadData, vehicle_interest: e.target.value})}
              required
            >
              <option value="">Select Vehicle</option>
              <option value="Kushaq">Kushaq</option>
              <option value="Slavia">Slavia</option>
              <option value="Kodiaq">Kodiaq</option>
              <option value="Superb">Superb</option>
              <option value="Octavia">Octavia</option>
            </Select>
            
            <Input
              label="Source Event"
              value={leadData.source_event}
              onChange={(e) => setLeadData({...leadData, source_event: e.target.value})}
              placeholder="e.g., Hyderabad Auto Expo 2024"
              required
            />
            
            <div className="md:col-span-2">
              <Textarea
                label="Notes"
                value={leadData.notes}
                onChange={(e) => setLeadData({...leadData, notes: e.target.value})}
                placeholder="Customer preferences, requirements, etc."
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Lead...' : 'Create Lead'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#006E5B]">Recent Leads</h2>
          <div className="flex space-x-4">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-40"
            >
              <option value="">All Vehicles</option>
              <option value="Kushaq">Kushaq</option>
              <option value="Slavia">Slavia</option>
              <option value="Kodiaq">Kodiaq</option>
              <option value="Superb">Superb</option>
              <option value="Octavia">Octavia</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.notes}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm text-gray-900">{lead.phone}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {lead.vehicle_interest}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{lead.source_event}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'New' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'Assigned to CRT' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {lead.status === 'New' && (
                      <Button
                        size="sm"
                        onClick={() => handoverToCRT(lead.id)}
                      >
                        <i className="ri-arrow-right-line mr-1"></i>
                        Handover to CRT
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
