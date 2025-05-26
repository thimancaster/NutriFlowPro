
// Sex types
export type Sex = 'M' | 'F';

// Activity levels
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

// Objectives
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia';

// Profile types
export type Profile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';

// Consultation types
export type ConsultationType = 'primeira_consulta' | 'retorno';

// Consultation status
export type ConsultationStatus = 'em_andamento' | 'completo';

// Nutrition constants
export const PROTEIN_RATIOS = {
  eutrofico: { min: 1.2, max: 1.6 },
  sobrepeso_obesidade: { min: 1.6, max: 2.0 },
  atleta: { min: 1.6, max: 2.2 }
};

export const LIPID_RATIOS = {
  eutrofico: { min: 0.8, max: 1.2 },
  sobrepeso_obesidade: { min: 0.8, max: 1.0 },
  atleta: { min: 1.0, max: 1.5 }
};

export const CALORIE_VALUES = {
  protein: 4,
  carbs: 4,
  fat: 9
};

// Form state interface
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

// Results interface
export interface ConsultationResults {
  tmb: number;
  fa: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

// Main consultation data interface
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  patient?: any;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  activity_level?: string;
  objective?: string;
  goal?: string;
  bmr?: number;
  tdee?: number;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  user_id?: string;
  date?: string;
  appointment_id?: string;
  results?: {
    bmr: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
}

// Result type for consultation operations
export interface ConsultationResult {
  bmr: number;
  get: number;
  vet: number;
  adjustment: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}
