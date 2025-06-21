
export interface AppointmentType {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnhancedAppointment {
  id: string;
  user_id: string;
  patient_id: string;
  appointment_type_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  title?: string;
  notes?: string;
  recommendations?: string;
  patient_notes?: string;
  private_notes?: string;
  duration_minutes: number;
  reminder_sent: boolean;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_amount?: number;
  measurements?: Record<string, any>;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  appointment_type?: AppointmentType;
}
