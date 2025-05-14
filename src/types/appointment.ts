
export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string;
  patientName?: string;
  start_time: string | Date;
  end_time: string | Date;
  title?: string;
  notes?: string;
  status: string;
  appointment_type_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AppointmentFormData {
  patient_id: string;
  appointment_type_id?: string;
  title?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  status?: string;
}

export type AppointmentType = {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color?: string;
};
