
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';

export interface Appointment {
  id: string;
  patient_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: string; // Required field - always populated
  appointment_type_id?: string; // Optional reference to appointment_types table
  status: AppointmentStatus;
  notes?: string;
  recommendations?: string;
  title?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  // Additional computed fields
  patient?: any;
  patientName?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  color: string;
  description?: string;
  duration_minutes?: number;
}

// Enhanced appointment with additional computed fields
export interface EnhancedAppointment extends Appointment {
  patient_name?: string;
  appointment_type?: AppointmentType;
}
