
import { ConsultationData, ConsultationResult } from './consultation';

// Custom type for Supabase consultations table
export interface SupabaseConsultation {
  id: string;
  user_id?: string;
  patient_id: string;
  weight: number;
  height: number;
  bmr: number;
  protein: number;
  carbs: number;
  fats: number;
  gender: string;
  activity_level: string;
  objective?: string;
  goal?: string;
  notes?: string;
  recommendations?: string;
  patient?: {
    name: string;
    age?: number;
    id?: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Function to convert Supabase consultation to our app's ConsultationData format
export const mapSupabaseConsultation = (data: any): ConsultationData => {
  // Check if the data is from a different table
  if (data.clinic_name !== undefined) {
    throw new Error('Invalid consultation data format');
  }

  return {
    id: data.id,
    user_id: data.user_id,
    patient_id: data.patient_id,
    weight: data.weight || 0,
    height: data.height || 0,
    age: data.age || 0,
    bmr: data.bmr || 0,
    tdee: data.tdee || 0,
    totalCalories: data.total_calories || data.tdee || 0,
    protein: data.protein || 0,
    carbs: data.carbs || 0,
    fats: data.fats || 0,
    gender: data.gender || '',
    activity_level: data.activity_level || '',
    goal: data.goal || '',
    objective: data.objective || '',
    notes: data.notes || '',
    recommendations: data.recommendations || '',
    patient: data.patient || { name: '' },
    results: {
      bmr: data.bmr || 0,
      get: data.tdee || 0,
      vet: data.tdee || 0,
      adjustment: 0,
      macros: {
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fats || 0
      }
    }
  };
};
