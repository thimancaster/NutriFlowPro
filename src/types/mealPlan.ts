export type MealType = 
  | 'cafe_da_manha'
  | 'lanche_manha' 
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'ceia';

export const MEAL_TYPES: Record<MealType, string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã', 
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};

export const MEAL_ORDER: MealType[] = [
  'cafe_da_manha',
  'lanche_manha',
  'almoco', 
  'lanche_tarde',
  'jantar',
  'ceia'
];

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  date: string;
  meals: MealPlanMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
  is_template?: boolean;
  day_of_week?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DetailedMealPlan extends MealPlan {
  patient?: Patient;
}

export interface MealPlanMeal {
  id: string;
  type: MealType;
  name: string;
  foods: any[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  meal_type: MealType;
  food_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index: number;
}

export interface MealPlanResponse {
  success: boolean;
  data?: MealPlan;
  error?: string;
}

export interface MealPlanListResponse {
  success: boolean;
  data?: MealPlan[];
  error?: string;
  total?: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  targets: MacroTargets;
  date?: string;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const MEAL_NAMES: Record<MealType, string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};
