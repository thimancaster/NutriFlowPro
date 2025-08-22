
export type MealType = 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia';

export const MEAL_TYPES: Record<MealType, string> = {
  cafe_da_manha: 'Café da manhã',
  lanche_manha: 'Lanche da manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da tarde',
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

export const MEAL_TIMES: Record<MealType, string> = {
  cafe_da_manha: '07:00',
  lanche_manha: '10:00',
  almoco: '12:30',
  lanche_tarde: '15:30',
  jantar: '19:00',
  ceia: '21:30'
};

export const DEFAULT_MEAL_DISTRIBUTION: Record<MealType, number> = {
  cafe_da_manha: 0.25,
  lanche_manha: 0.10,
  almoco: 0.35,
  lanche_tarde: 0.10,
  jantar: 0.15,
  ceia: 0.05
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

// Legacy alias for backward compatibility
export interface ConsolidatedMealItem extends MealPlanItem {
  meal_type?: MealType;
}

export interface ConsolidatedMeal {
  id: string;
  type: MealType;
  name: string;
  time?: string;
  items: MealPlanItem[];
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
  date?: string;
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

export interface MealPlanGenerationResult {
  success: boolean;
  data?: ConsolidatedMealPlan;
  error?: string;
}

export interface MealPlanResponse {
  data: ConsolidatedMealPlan[];
  count: number;
}

// PDF Types
export interface PDFMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  percent: number;
  suggestions: string[];
}

export interface PDFMealPlanData {
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  meals: PDFMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

// Legacy compatibility
export type DetailedMealPlan = ConsolidatedMealPlan;
export type MealPlan = ConsolidatedMealPlan;
