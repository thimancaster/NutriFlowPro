
export interface AppointmentType {
  value: string;
  label: string;
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
  type: string;
  status: string;
  notes?: string;
  recommendations?: string;
  measurements?: any;
  created_at?: string;
  updated_at?: string;
}
