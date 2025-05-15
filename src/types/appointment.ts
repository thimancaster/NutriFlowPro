
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'noshow' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: string;
  appointment_type_id?: string;
  status: AppointmentStatus;
  notes: string;
  recommendations: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  patient?: any;
  title?: string;
  patientName?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  color: string;
  description?: string;
  duration_minutes?: number;
}
