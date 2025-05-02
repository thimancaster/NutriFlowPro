
import { Json } from '@/integrations/supabase/types';

export interface Patient {
  id: string;
  user_id: string;
  birth_date: string | null;
  created_at: string;
  updated_at: string;
  measurements: Json;
  goals: {
    objective?: string;
    weight?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    [key: string]: any;
  };
  gender: string | null;
  address: string | null;
  notes: string | null;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface MealPlan {
  id?: string;
  user_id?: string;
  date: string;
  meals: MealData[];
  mealDistribution?: Record<string, MealDistributionItem>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  patient_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MealData {
  name: string;
  percent: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions?: string[];
}

export interface MealDistributionItem {
  name: string;
  percent: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions?: string[];
}

export interface ConsultationData {
  weight: string;
  height: string;
  age: string;
  sex: string;
  objective: string;
  profile: string;
  activityLevel: string;
  results: {
    tmb: number;
    fa: number;
    get: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    }
  }
}
