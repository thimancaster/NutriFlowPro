
// Sex types
export type Sex = 'M' | 'F';

// Activity levels
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';

// Objectives
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';

// Profile types - CORRIGIDO PARA COMPATIBILIDADE
export type Profile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';

// Consultation types
export type ConsultationType = 'primeira_consulta' | 'retorno';

// Consultation status
export type ConsultationStatus = 'em_andamento' | 'completo';

// Activity factors for TDEE calculation
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

// Objective adjustment factors
export const OBJECTIVE_FACTORS: Record<Objective, number> = {
  emagrecimento: 0.8,
  manutenção: 1.0,
  hipertrofia: 1.15,
  personalizado: 1.0
};

// Nutrition constants - CORRIGIDOS
export const PROTEIN_RATIOS: Record<Profile, number> = {
  eutrofico: 1.4,
  sobrepeso_obesidade: 1.8,
  atleta: 2.0
};

export const LIPID_RATIOS: Record<Profile, number> = {
  eutrofico: 1.0,
  sobrepeso_obesidade: 0.8,
  atleta: 1.2
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

// Main consultation data interface - CORRIGIDO
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  user_id?: string;
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
  totalCalories: number; // REQUIRED
  protein: number;
  carbs: number;
  fats: number;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  date?: string;
  appointment_id?: string;
  recommendations?: string;
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
