
// Define the allowed profile types
export type Profile = 'magro' | 'normal' | 'sobrepeso' | 'obeso' | 'atleta' | 'eutrofico' | 'sobrepeso_obesidade';

// Define consultation related types
export type Sex = 'M' | 'F';
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type ConsultationType = 'primeira_consulta' | 'retorno';
export type ConsultationStatus = 'em_andamento' | 'completo';

// Constants for calculations
export const PROTEIN_RATIOS: Record<Profile, number> = {
  magro: 2.0,
  eutrofico: 2.0,
  normal: 1.8,
  sobrepeso: 1.6,
  sobrepeso_obesidade: 1.6,
  obeso: 1.4,
  atleta: 2.2,
};

export const LIPID_RATIOS: Record<Profile, number> = {
  magro: 1.0,
  eutrofico: 1.0,
  normal: 0.8,
  sobrepeso: 0.7,
  sobrepeso_obesidade: 0.7,
  obeso: 0.6,
  atleta: 1.0,
};

export const CALORIE_VALUES = {
  protein: 4,
  carbs: 4,
  fat: 9,
};

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

export const OBJECTIVE_FACTORS: Record<Objective, number> = {
  emagrecimento: 0.8,
  manutenção: 1.0,
  hipertrofia: 1.15,
  personalizado: 1.0
};

// Type for consultation form state
export interface ConsultationFormState {
  weight: string;
  height: string;
  age: string;
  sex: Sex;
  objective: Objective;
  profile: Profile;
  activityLevel: ActivityLevel;
  consultationType?: ConsultationType;
  consultationStatus?: ConsultationStatus;
}

// Type for consultation calculation results
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

// Define the main consultation data interface
export interface ConsultationData {
  id: string;
  patient_id: string;
  user_id?: string;
  date?: string | Date;
  weight?: number;
  height?: number;
  age?: number;
  gender?: string;
  activity_level?: string;
  objective?: string;
  consultation_type?: string;
  bmr?: number;
  vet?: number;
  tdee?: number;
  carbs_percentage?: number;
  protein_percentage?: number;
  fat_percentage?: number;
  patient?: {
    name: string;
    [key: string]: any;
  };
  results?: ConsultationResult;
  // Additional fields needed based on errors
  protein?: number;
  carbs?: number;
  fats?: number;
  goal?: string;
  notes?: string;
  appointment_id?: string;
  recommendations?: string;
}

// Type for consultation result
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
