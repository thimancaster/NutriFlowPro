
export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  patientName?: string;
  date: Date;
  type: string;
  status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentFormData {
  patient_id: string;
  date: Date;
  type: string;
  status: string;
  notes?: string;
}

export type AppointmentType = {
  id: string;
  name: string;
  description?: string;
  color?: string;
};
