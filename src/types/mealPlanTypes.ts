
export type MealType = 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia';

export const MEAL_TYPES: MealType[] = [
  'cafe_da_manha',
  'lanche_manha', 
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia'
];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  cafe_da_manha: 'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};

export interface MealPlanItem {
  id: string;
  meal_id: string;
  food_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index?: number;
}

export interface ConsolidatedMeal {
  id: string;
  type: MealType;
  name: string;
  time?: string;
  foods: MealPlanItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface ConsolidatedMealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  date: string;
  meals: ConsolidatedMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
  is_template?: boolean;
  day_of_week?: number;
  created_at: string;
  updated_at: string;
}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  calculationId?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  culturalRules?: any;
  targets?: {
    kcal: number;
    protein_g: number;
    fat_g: number;
    carb_g: number;
    by_meal?: Record<MealType, {
      kcal: number;
      protein_g: number;
      fat_g: number;
      carb_g: number;
    }>;
  };
}

export interface MealPlanResponse {
  data: ConsolidatedMealPlan[];
  count: number;
}

export type DetailedMealPlan = ConsolidatedMealPlan;

// Legacy compatibility
export type MealPlan = ConsolidatedMealPlan;
