
export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
  value?: string;
  label?: string;
}

export interface AppointmentStatus {
  value: string;
  label: string;
}

export interface Appointment {
  id: string;
  user_id?: string;
  patient_id?: string;
  date: Date | string;
  start_time: Date | string;
  end_time: Date | string;
  title: string;
  appointment_type_id?: string;
  type: string;
  status: string;
  notes?: string;
  recommendations?: string;
  measurements?: any;
  patientName?: string;
  created_at?: string;
  updated_at?: string;
}
