
// Define consultation types to improve type safety

export type Sex = 'M' | 'F';

export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia';

export type Profile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';

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
  consultationType?: ConsultationType;
  consultationStatus?: ConsultationStatus;
}

export interface ConsultationResults {
  tmb: number;
  fa: number;
  get: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  }
}

// Constants for macronutrient calculation by profile
export const PROTEIN_RATIOS = {
  eutrofico: 1.2, // g/kg - Using lower bound of range (1.2-1.5)
  sobrepeso_obesidade: 2.0, // g/kg
  atleta: 1.8 // g/kg - Using middle of range (1.6-2.2)
};

export const LIPID_RATIOS = {
  eutrofico: 0.8, // g/kg
  sobrepeso_obesidade: 0.5, // g/kg
  atleta: 1.0 // g/kg
};

// Calorie content per gram of macronutrient
export const CALORIE_VALUES = {
  protein: 4, // kcal/g
  carbs: 4, // kcal/g
  fat: 9 // kcal/g
};
