
import { Patient } from './patient';

// Define standardized types for consultation data
export type Sex = 'M' | 'F';
export type Objective = 'manutenção' | 'emagrecimento' | 'hipertrofia' | 'personalizado';
export type Profile = 'magro' | 'normal' | 'sobrepeso' | 'obeso' | 'atleta';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type ConsultationType = 'primeira_consulta' | 'retorno';
export type ConsultationStatus = 'em_andamento' | 'completo';

// Constants for calculation based on profile
export const PROTEIN_RATIOS: Record<Profile, number> = {
  magro: 2.0,
  normal: 1.8,
  sobrepeso: 1.6,
  obeso: 1.4,
  atleta: 2.2
};

export const LIPID_RATIOS: Record<Profile, number> = {
  magro: 1.0,
  normal: 0.8,
  sobrepeso: 0.7,
  obeso: 0.6,
  atleta: 1.0
};

export const CALORIE_VALUES = {
  protein: 4,
  carbs: 4,
  fat: 9
};

// Activity factors for different activity levels
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

// Objective factors for caloric adjustments
export const OBJECTIVE_FACTORS: Record<Exclude<Objective, 'personalizado'>, number> = {
  emagrecimento: 0.8,   // Weight loss (20% deficit)
  manutenção: 1.0,      // Maintenance
  hipertrofia: 1.15     // Muscle gain (15% surplus)
};

export interface ConsultationResult {
  bmr: number;
  get: number;
  vet: number;
  tdee?: number;
  adjustment: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    proteinPerKg?: number;
  };
}

export interface ConsultationFormState {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  objective: Objective;
  profile: Profile;
  activityLevel: ActivityLevel;
  consultationType: ConsultationType;
  consultationStatus: ConsultationStatus;
}

export interface ConsultationResults {
  tmb: number;
  get: number;
  fa: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ConsultationData {
  id: string;
  user_id?: string;
  patient_id: string;
  date?: string;
  appointment_id?: string;
  
  // Anthropometry data
  anthropometry?: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityFactor: number;
    bodyFat: number | null;
  };
  
  // Nutritional objectives
  nutritionalObjectives?: {
    objective: string;
    customCalories: number | null;
  };
  
  // Macro distribution
  macroDistribution?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  
  // Original properties
  weight: number;
  height: number;
  age?: number;
  bmr: number;
  tdee?: number;
  protein: number;
  carbs: number;
  fats: number;
  gender: string;
  activity_level: string;
  goal?: string;
  objective?: string;
  notes?: string;
  recommendations?: string;
  
  patient?: {
    name: string;
    age?: number;
    id?: string;
  };
  
  results: ConsultationResult;
}
