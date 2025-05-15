
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'noshow';

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string;
}

export interface Appointment {
  id: string;
  user_id?: string;
  patient_id: string;
  patientName?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  appointment_type_id?: string;
  type?: string;
  status: AppointmentStatus;
  title?: string;
  notes?: string;
  recommendations?: string;
  measurements?: any;
  created_at?: string;
  updated_at?: string;
  patient?: {
    name: string;
    id: string;
  };
}
