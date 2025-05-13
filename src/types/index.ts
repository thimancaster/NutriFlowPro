export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  cpf?: string;
  birth_date: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'archived';
  goals?: {
    objective?: string;
    profile?: string;
  };
  address?: {
    cep?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  };
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
  weight?: string | number;
  height?: string | number;
  age?: string | number;
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
    vet?: number; // Add the vet property to match the usage in useCalculationLogic.ts
    adjustment?: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
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

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page: number;
  pageSize: number;
}
