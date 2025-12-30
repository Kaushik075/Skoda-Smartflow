
import { useState, useEffect } from 'react';
import { Button } from '../../../components/base/Button';
import { Input } from '../../../components/base/Input';
import { Select } from '../../../components/base/Select';
import { Textarea } from '../../../components/base/Textarea';
import { Calendar } from '../../../components/feature/Calendar';
import { db } from '../../../services/database';
import { aiService } from '../../../services/ai';
import { wsService } from '../../../services/websocket';
import { Lead, Schedule } from '../../../types';

export function CRTDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');

  const [updateData, setUpdateData] = useState({
    notes: '',
    assigned_to: '',
    status: ''
  });

  useEffect(() => {
    loadLeads();
    wsService.connect();
  }, []);

  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await db.getLeads();
      setLeads(data.filter(lead => lead.status === 'Assigned to CRT'));
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setIsLoading(false);
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

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    setUpdateData({
      notes: lead.notes || '',
      status: lead.status,
      assigned_to: lead.assigned_to || ''
    });
    setAiSummary('');
  };

  const generateAISummary = async () => {
    if (!selectedLead) return;

    setIsGeneratingSummary(true);
    try {
      const summary = await aiService.generateLeadSummary(
        selectedLead.notes || '',
        selectedLead.vehicle_interest
      );
      setAiSummary(summary);

      // Store in database
      await db.createFeedbackSummary({
        lead_id: selectedLead.id,
        ai_summary: summary
      });
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handoverToSales = async () => {
    if (!selectedLead) return;

    setIsLoading(true);
    try {
      await db.updateLead(selectedLead.id, {
        status: 'Assigned to Sales',
        assigned_to: '3', // Sales Executive ID
        notes: updateData.notes
      });

      // Create schedule for sales executive
      await db.createSchedule({
        executive_id: '3',
        date: new Date().toISOString().split('T')[0],
        summary: `Follow up with ${selectedLead.name} - ${selectedLead.vehicle_interest}`,
        customer_name: selectedLead.name,
        vehicle_interest: selectedLead.vehicle_interest,
        ai_summary: aiSummary
      });

      setSelectedLead(null);
      loadLeads();
    } catch (error) {
      console.error('Failed to handover to sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-[#006E5B] rounded-lg flex items-center justify-center">
              <i className="ri-user-received-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Assigned Leads</p>
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
              <p className="text-sm text-gray-600">Processed Today</p>
              <p className="text-2xl font-bold text-[#006E5B]">5</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <i className="ri-robot-line text-white text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">AI Summaries</p>
              <p className="text-2xl font-bold text-[#006E5B]">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
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
          executiveId="2"
          onEventCreate={handleEventCreate}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#006E5B] mb-6">Assigned Leads</h2>

          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedLead?.id === lead.id
                    ? 'border-[#006E5B] bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleLeadSelect(lead)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {lead.vehicle_interest}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">{lead.source_event}</p>
                  {lead.notes && (
                    <p className="text-sm text-gray-500 mt-1 truncate">{lead.notes}</p>
                  )}
                </div>
              </div>
            ))}

            {leads.length === 0 && (
              <div className="text-center py-8">
                <i className="ri-inbox-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">No leads assigned to CRT</p>
              </div>
            )}
          </div>
        </div>

        {/* Lead Details & Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#006E5B] mb-6">Lead Management</h2>

          {selectedLead ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{selectedLead.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Phone:</p>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Vehicle Interest:</p>
                    <p className="font-medium">{selectedLead.vehicle_interest}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Source:</p>
                    <p className="font-medium">{selectedLead.source_event}</p>
                  </div>
                </div>
              </div>

              <Textarea
                label="Update Notes"
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                placeholder="Add additional notes about customer interaction..."
                rows={4}
              />

              <div className="space-y-4">
                <Button
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary}
                  variant="secondary"
                  className="w-full"
                >
                  {isGeneratingSummary ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Generating AI Summary...
                    </>
                  ) : (
                    <>
                      <i className="ri-robot-line mr-2"></i>
                      Generate AI Summary & Follow-up Script
                    </>
                  )}
                </Button>

                {aiSummary && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">AI Generated Summary:</h4>
                    <p className="text-blue-800 text-sm whitespace-pre-line">{aiSummary}</p>
                  </div>
                )}

                <Button
                  onClick={handoverToSales}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="ri-arrow-right-line mr-2"></i>
                      Handover to Sales Executive
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-hand-coin-line text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-500">Select a lead to manage</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
