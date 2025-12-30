import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { db } from '../../services/database';
import { Schedule } from '../../types';
import { Button } from '../base/Button';
import { Input } from '../base/Input';
import { Select } from '../base/Select';
import { Textarea } from '../base/Textarea';

interface CalendarProps {
  executiveId?: string;
  onEventCreate?: (event: Schedule) => void;
}

export function Calendar({ executiveId, onEventCreate }: CalendarProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [eventData, setEventData] = useState({
    lead_id: '',
    date: '',
    time: '',
    summary: '',
    customer_name: '',
    vehicle_interest: ''
  });

  useEffect(() => {
    loadSchedules();
    loadLeads();
  }, [executiveId]);

  const loadSchedules = async () => {
    try {
      const data = await db.getSchedules(executiveId);
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const loadLeads = async () => {
    try {
      const data = await db.getLeads();
      setLeads(data.filter(lead => lead.status === 'Assigned to Sales'));
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setEventData({
      ...eventData,
      date: info.dateStr
    });
    setShowEventForm(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const selectedLead = leads.find(l => l.id === eventData.lead_id);
      
      const newSchedule = await db.createSchedule({
        executive_id: executiveId || '',
        date: eventData.date,
        time: eventData.time,
        summary: eventData.summary,
        customer_name: selectedLead?.name || eventData.customer_name,
        vehicle_interest: selectedLead?.vehicle_interest || eventData.vehicle_interest,
        lead_id: eventData.lead_id,
        ai_prep_notes: `Lead Score: ${selectedLead?.lead_score}/100. Concerns: ${selectedLead?.concerns?.join(', ')}. ${eventData.summary}`,
        status: 'pending',
        created_by: executiveId || '1'
      });
      
      setSchedules([...schedules, newSchedule]);
      setShowEventForm(false);
      setEventData({
        lead_id: '',
        date: '',
        time: '',
        summary: '',
        customer_name: '',
        vehicle_interest: ''
      });
      
      if (onEventCreate) {
        onEventCreate(newSchedule);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calendarEvents = schedules.map(schedule => ({
    id: schedule.id,
    title: `${schedule.customer_name} - ${schedule.vehicle_interest}`,
    start: `${schedule.date}T${schedule.time}`,
    backgroundColor: schedule.claimed_by ? '#006E5B' : '#00FFAA',
    borderColor: schedule.claimed_by ? '#006E5B' : '#00FFAA',
    textColor: schedule.claimed_by ? '#FFFFFF' : '#000000'
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#006E5B]">Schedule Calendar</h2>
        <Button
          onClick={() => setShowEventForm(true)}
          size="sm"
        >
          <i className="ri-add-line mr-2"></i>
          Add Event
        </Button>
      </div>

      <div className="mb-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[#006E5B] mb-4">Schedule New Event</h3>
            
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <Select
                label="Customer/Lead"
                value={eventData.lead_id}
                onChange={(e) => {
                  const selectedLead = leads.find(l => l.id === e.target.value);
                  setEventData({
                    ...eventData,
                    lead_id: e.target.value,
                    customer_name: selectedLead?.name || '',
                    vehicle_interest: selectedLead?.vehicle_interest || ''
                  });
                }}
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
                label="Date"
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({...eventData, date: e.target.value})}
                required
              />
              
              <Input
                label="Time"
                type="time"
                value={eventData.time}
                onChange={(e) => setEventData({...eventData, time: e.target.value})}
                required
              />
              
              <Textarea
                label="Summary/Notes"
                value={eventData.summary}
                onChange={(e) => setEventData({...eventData, summary: e.target.value})}
                placeholder="Follow-up call, test drive, etc."
                rows={3}
                required
              />
              
              <div className="flex space-x-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Event'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEventForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}