
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentType = 'consulta' | 'retorno' | 'avaliacao' | 'urgencia';

export interface Appointment {
  id: string;
  patient_id: string;
  user_id?: string;
  appointment_type_id?: string;
  title?: string;
  type: string;
  status: AppointmentStatus;
  date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  recommendations?: string;
  created_at?: string;
  updated_at?: string;
  patient?: {
    id: string;
    name: string;
  };
  patientName?: string;
}
