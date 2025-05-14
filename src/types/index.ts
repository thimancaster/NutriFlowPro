
import { User } from '@supabase/supabase-js';
import { Json } from '@/integrations/supabase/types';

// Extend the available types with our application-specific types
export * from './appointment';
export * from './meal';

export interface Patient {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  status?: 'active' | 'archived';
  goals?: {
    weight?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    objective?: string;
    profile?: string;
  };
  measurements?: {
    weight?: number;
    height?: number;
    waist?: number;
    hip?: number;
  }[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  perPage?: number;
}

export interface PatientFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MealPlan {
  id?: string;
  name: string;
  patient_id: string;
  consultation_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
  mealDistribution: MealDistributionItem[];
  meals: any[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ConsultationData {
  id: string;
  user_id?: string;
  patient_id?: string;
  patient?: {
    id: string;
    name: string;
    gender?: string | null;
    age?: number;
  };
  created_at?: string;
  weight?: number;
  height?: number;
  objective?: string;
  activityLevel?: string;
  gender?: string;
  age?: number;
  tipo?: 'primeira_consulta' | 'retorno';
  results?: {
    bmr: number;
    get: number;
    adjustment: number;
    vet: number;
    macros: {
      carbs: number;
      protein: number;
      fat: number;
      proteinPerKg?: number;
    }
  }
}

// User profile with extra fields
export interface UserProfile extends User {
  name?: string;
  crn?: string; 
  specialty?: string;
  clinic_name?: string;
  photo_url?: string;
}
