
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'noshow' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  type: string;
  status: AppointmentStatus;
  notes: string;
  recommendations: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  patient?: any;
}

export interface AppointmentType {
  id: string;
  name: string;
  color: string;
  description?: string;
}
