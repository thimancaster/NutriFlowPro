
// Consolidated and corrected meal plan types
export interface MealPlanFood {
  id: string;
  food_id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index?: number;
}

export interface MealPlanMeal {
  id: string;
  type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  name: string;
  foods: MealPlanFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id?: string;
  calculation_id?: string;
  date: string;
  meals: MealPlanMeal[];
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

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  meal_type: string;
  food_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface MealPlanFilters {
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  is_template?: boolean;
  limit?: number;
}

export interface MealPlanResponse {
  success: boolean;
  data?: MealPlan;
  error?: string;
}

export interface MealPlanListResponse {
  success: boolean;
  data?: MealPlan[];
  total?: number;
  error?: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealDistribution {
  breakfast: number;
  morning_snack: number;
  lunch: number;
  afternoon_snack: number;
  dinner: number;
  evening_snack: number;
}

export const DEFAULT_MEAL_DISTRIBUTION: MealDistribution = {
  breakfast: 0.25,
  morning_snack: 0.10,
  lunch: 0.30,
  afternoon_snack: 0.10,
  dinner: 0.20,
  evening_snack: 0.05
};
