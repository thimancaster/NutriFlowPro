
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
  goals?: any; // Added for compatibility with existing code
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

// Add missing type definitions to fix build errors
export interface MealDistributionItem {
  id: string;
  name: string;
  percentage: number;
}

export interface ConsultationData {
  id?: string;
  patient_id?: string;
  date?: string;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activity_level?: string;
  goal?: string;
  meals_per_day?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MealPlan {
  id?: string;
  name: string;
  patient_id: string;
  consultation_id?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals?: any[];
  created_at?: string;
  updated_at?: string;
}
