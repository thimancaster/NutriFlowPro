
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
  address?: string;
  notes?: string;
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

// Update MealDistributionItem to include all required properties
export interface MealDistributionItem {
  id: string;
  name: string;
  percentage: number;
  percent?: number; // Compatibility for existing code
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  suggestions?: any[];
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
  sex?: string;
  objective?: string;
  profile?: string;
  activityLevel?: string;
  consultationType?: string;
  consultationStatus?: string;
  results?: {
    tmb: number;
    get: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    }
  };
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
  mealDistribution?: MealDistributionItem[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
  date?: string;
}
