
export interface Appointment {
  id?: string;
  patient_id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string | Date;
  end_time: string | Date;
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}
