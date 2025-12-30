
export interface User {
  id: string;
  username: string;
  role: 'Marketing Team' | 'CRT' | 'Sales Executive' | 'IT Admin';
  name: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle_interest: 'Kushaq' | 'Slavia' | 'Kodiaq' | 'Superb' | 'Octavia';
  source_event: string;
  assigned_to?: string;
  status: 'New' | 'Assigned to CRT' | 'Assigned to Sales' | 'Test Drive' | 'Delivery' | 'Registered' | 'Not Interested';
  notes?: string;
  created_at: string;
  lead_score?: number;
  last_contact?: string;
  concerns?: string[];
}

export interface Call {
  id: string;
  lead_id: string;
  date_time: string;
  outcome: 'Interested' | 'Not Interested' | 'Test Drive Scheduled';
  feedback: string;
  vehicle: string;
  executive_id: string;
}

export interface Schedule {
  id: string;
  executive_id: string;
  date: string;
  time: string;
  summary: string;
  customer_name: string;
  vehicle_interest: string;
  lead_id: string;
  ai_summary?: string;
  ai_prep_notes?: string;
  claimed_by?: string;
  claimed_at?: string;
  claim_timeout?: string;
  status: 'pending' | 'claimed' | 'completed' | 'expired';
  created_by: string;
}

export interface FeedbackSummary {
  id: string;
  lead_id: string;
  ai_summary: string;
  created_at: string;
}

export interface Alert {
  id: string;
  schedule_id: string;
  customer_name: string;
  lead_id: string;
  vehicle: string;
  scheduled_time: string;
  ai_prep_notes: string;
  claim_status: 'unclaimed' | 'claimed';
  claimed_by?: string;
  claimed_at?: string;
}

export interface ExecutiveStats {
  executive_id: string;
  date: string;
  claimed_count: number;
  completed_count: number;
  success_rate: number;
}
