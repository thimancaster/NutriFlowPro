
export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  meal_type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
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

export interface DetailedMealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  day_of_week?: number;
  is_template?: boolean;
  notes?: string;
  items?: MealPlanItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MealTypeConfig {
  type: MealPlanItem['meal_type'];
  name: string;
  percentage: number;
  timeRange: string;
}

export interface NutritionalTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  targets: NutritionalTargets;
  date?: string;
}
