
// Define consultation types to improve type safety

export type Sex = 'M' | 'F';

export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia';

export type Profile = 'magro' | 'obeso' | 'atleta';

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
