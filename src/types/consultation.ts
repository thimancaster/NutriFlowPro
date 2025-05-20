
// Define types for consultation data
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

// Additional types for the consultation form
export type Sex = 'M' | 'F';
export type Objective = 'manutenção' | 'emagrecimento' | 'hipertrofia' | 'personalizado';
export type Profile = 'magro' | 'normal' | 'sobrepeso' | 'obeso' | 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type ConsultationType = 'primeira_consulta' | 'retorno';
export type ConsultationStatus = 'em_andamento' | 'completo';

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

// Constants for calculation
export const PROTEIN_RATIOS = {
  magro: 2.0,
  normal: 1.8,
  sobrepeso: 1.6,
  obeso: 1.4,
  eutrofico: 1.8,
  sobrepeso_obesidade: 1.6,
  atleta: 2.2
};

export const LIPID_RATIOS = {
  magro: 1.0,
  normal: 0.8,
  sobrepeso: 0.7,
  obeso: 0.6,
  eutrofico: 0.8,
  sobrepeso_obesidade: 0.7,
  atleta: 1.0
};

export const CALORIE_VALUES = {
  protein: 4,
  carbs: 4,
  fat: 9
};
