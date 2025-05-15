
import { Json } from '@/integrations/supabase/types';

export interface Appointment {
  id: string;
  user_id?: string;
  patient_id?: string;
  date?: string;
  measurements?: Json;
  created_at?: string;
  updated_at?: string;
  type?: string;
  status?: AppointmentStatus;
  notes?: string;
  recommendations?: string;
  // Added fields for proper TypeScript support
  title?: string;
  start_time?: string;
  end_time?: string;
  appointment_type_id?: string;
  patientName?: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled' | 'no-show';

export interface AppointmentType {
  id: string;
  name: string;
  duration_minutes: number;
}
