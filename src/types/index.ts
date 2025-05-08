export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  description: string;
  color: string;
  duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id?: string;
  user_id?: string;
  patient_id: string;
  patientName?: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  appointment_type_id?: string;
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}
