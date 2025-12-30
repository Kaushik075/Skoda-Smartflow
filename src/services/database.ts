
import { Lead, Call, Schedule, FeedbackSummary, Alert, ExecutiveStats } from '../types';

// Mock database connection
const DB_CONNECTION = 'mysql://user:pass@localhost/skoda_db';

// Generate realistic sample data for 30 leads
const generateSampleLeads = (): Lead[] => {
  const names = [
    'Ramesh Patel', 'Sneha Reddy', 'Vikram Singh', 'Priya Sharma', 'Arjun Kumar',
    'Kavya Nair', 'Rohit Gupta', 'Meera Joshi', 'Sanjay Verma', 'Anita Rao',
    'Deepak Agarwal', 'Sunita Mehta', 'Rajesh Khanna', 'Pooja Bansal', 'Amit Tiwari',
    'Ritu Malhotra', 'Suresh Yadav', 'Neha Kapoor', 'Manoj Sinha', 'Divya Iyer',
    'Kiran Desai', 'Ashok Pandey', 'Shweta Jain', 'Vinod Chandra', 'Rekha Pillai',
    'Harish Bhatia', 'Nisha Agrawal', 'Ravi Saxena', 'Geeta Mishra', 'Sunil Chopra'
  ];
  
  const vehicles = ['Kushaq', 'Slavia', 'Kodiaq', 'Superb', 'Octavia'];
  const events = ['Hyderabad Auto Expo 2024', 'Mall Exhibition', 'Showroom Visit', 'Online Inquiry', 'Referral'];
  const statuses = ['New', 'Assigned to CRT', 'Assigned to Sales', 'Test Drive'];
  const concerns = [
    ['mileage', 'maintenance cost'], ['price', 'features'], ['safety', 'resale value'],
    ['comfort', 'space'], ['performance', 'fuel efficiency'], ['technology', 'connectivity']
  ];

  return names.map((name, index) => ({
    id: (index + 1).toString(),
    name,
    phone: `+91 ${9800000000 + index}`,
    email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
    vehicle_interest: vehicles[index % vehicles.length] as any,
    source_event: events[index % events.length],
    status: statuses[index % statuses.length] as any,
    assigned_to: index % 4 === 0 ? '2' : index % 3 === 0 ? '3' : undefined,
    notes: `Interested in ${vehicles[index % vehicles.length]}, ${index % 2 === 0 ? 'family of 4' : 'first car buyer'}`,
    created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    lead_score: Math.floor(Math.random() * 100) + 1,
    last_contact: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    concerns: concerns[index % concerns.length]
  }));
};

// Generate sample schedules for today
const generateTodaySchedules = (): Schedule[] => {
  const today = new Date().toISOString().split('T')[0];
  const times = ['09:00', '10:30', '11:00', '14:00', '15:30', '16:00', '17:00'];
  const leadIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  return leadIds.slice(0, 7).map((leadId, index) => ({
    id: `sched_${index + 1}`,
    executive_id: '',
    date: today,
    time: times[index],
    summary: `Follow-up call scheduled`,
    customer_name: leads[parseInt(leadId) - 1]?.name || 'Customer',
    vehicle_interest: leads[parseInt(leadId) - 1]?.vehicle_interest || 'Kushaq',
    lead_id: leadId,
    ai_prep_notes: `Lead Score: ${leads[parseInt(leadId) - 1]?.lead_score}/100. Concerns: ${leads[parseInt(leadId) - 1]?.concerns?.join(', ')}. Suggest test drive comparison.`,
    status: 'pending' as const,
    created_by: '2'
  }));
};

// Mock data storage
let leads: Lead[] = generateSampleLeads();
let calls: Call[] = [];
let schedules: Schedule[] = generateTodaySchedules();
let feedbackSummaries: FeedbackSummary[] = [];
let executiveStats: ExecutiveStats[] = [];

// Database operations
export const db = {
  // Leads operations
  getLeads: async (): Promise<Lead[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...leads];
  },

  createLead: async (lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      lead_score: Math.floor(Math.random() * 100) + 1,
      concerns: ['general inquiry']
    };
    leads.push(newLead);
    return newLead;
  },

  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
      leads[index] = { ...leads[index], ...updates };
      return leads[index];
    }
    return null;
  },

  // Calls operations
  getCalls: async (): Promise<Call[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...calls];
  },

  createCall: async (call: Omit<Call, 'id'>): Promise<Call> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCall: Call = {
      ...call,
      id: Date.now().toString()
    };
    calls.push(newCall);
    return newCall;
  },

  // Schedules operations
  getSchedules: async (executiveId?: string): Promise<Schedule[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return executiveId 
      ? schedules.filter(s => s.executive_id === executiveId)
      : [...schedules];
  },

  createSchedule: async (schedule: Omit<Schedule, 'id'>): Promise<Schedule> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSchedule: Schedule = {
      ...schedule,
      id: Date.now().toString(),
      status: 'pending'
    };
    schedules.push(newSchedule);
    return newSchedule;
  },

  updateSchedule: async (id: string, updates: Partial<Schedule>): Promise<Schedule | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = schedules.findIndex(s => s.id === id);
    if (index !== -1) {
      schedules[index] = { ...schedules[index], ...updates };
      return schedules[index];
    }
    return null;
  },

  // Alert operations
  getTodayAlerts: async (date?: string): Promise<Alert[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    return schedules
      .filter(s => s.date === targetDate && s.status === 'pending')
      .map(schedule => ({
        id: `alert_${schedule.id}`,
        schedule_id: schedule.id,
        customer_name: schedule.customer_name,
        lead_id: schedule.lead_id,
        vehicle: schedule.vehicle_interest,
        scheduled_time: `${schedule.date} ${schedule.time}`,
        ai_prep_notes: schedule.ai_prep_notes || 'No prep notes available',
        claim_status: schedule.claimed_by ? 'claimed' : 'unclaimed',
        claimed_by: schedule.claimed_by,
        claimed_at: schedule.claimed_at
      }));
  },

  claimAlert: async (scheduleId: string, executiveId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const schedule = schedules.find(s => s.id === scheduleId);
    
    if (schedule && !schedule.claimed_by) {
      schedule.claimed_by = executiveId;
      schedule.claimed_at = new Date().toISOString();
      schedule.claim_timeout = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      schedule.status = 'claimed';
      
      // Update executive stats
      const today = new Date().toISOString().split('T')[0];
      let stats = executiveStats.find(s => s.executive_id === executiveId && s.date === today);
      if (!stats) {
        stats = {
          executive_id: executiveId,
          date: today,
          claimed_count: 0,
          completed_count: 0,
          success_rate: 0
        };
        executiveStats.push(stats);
      }
      stats.claimed_count++;
      
      return true;
    }
    return false;
  },

  releaseExpiredClaims: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const now = new Date();
    
    schedules.forEach(schedule => {
      if (schedule.claim_timeout && new Date(schedule.claim_timeout) < now) {
        schedule.claimed_by = undefined;
        schedule.claimed_at = undefined;
        schedule.claim_timeout = undefined;
        schedule.status = 'pending';
      }
    });
  },

  // Executive stats operations
  getExecutiveStats: async (executiveId: string, date?: string): Promise<ExecutiveStats | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const stats = executiveStats.find(s => s.executive_id === executiveId && s.date === targetDate);
    return stats || {
      executive_id: executiveId,
      date: targetDate,
      claimed_count: 0,
      completed_count: 0,
      success_rate: 0
    };
  },

  // Feedback summaries operations
  getFeedbackSummaries: async (): Promise<FeedbackSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...feedbackSummaries];
  },

  createFeedbackSummary: async (summary: Omit<FeedbackSummary, 'id' | 'created_at'>): Promise<FeedbackSummary> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newSummary: FeedbackSummary = {
      ...summary,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    feedbackSummaries.push(newSummary);
    return newSummary;
  }
};
