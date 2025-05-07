
export interface Patient {
  id: string;
  name: string;
  birth_date?: string | null;
  gender?: string | null;
  goals?: {
    objective?: string;
    profile?: string;
  } | null;
  email?: string | null;
  phone?: string | null;
}

export interface ConsultationData {
  weight?: string;
  height?: string;
  age?: string;
  sex?: string;
  objective?: string;
  profile?: string;
  activityLevel?: string;
  results?: {
    tmb: number;
    fa: number;
    get: number;
    adjustment?: number;
    vet?: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
    };
  };
}

export interface MealPlan {
  id?: string;
  date?: string;
  patient_id?: string;
  meals?: any[];
  mealDistribution?: Record<string, MealDistributionItem>;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
}

export interface MealDistributionItem {
  name: string;
  percent: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}
