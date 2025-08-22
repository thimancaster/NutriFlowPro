
export interface MealDistributionItem {
  id: string;
  name: string;
  time: string;
  percent: number;
  percentage: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: MealAssemblyFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  suggestions: any[];
}

export interface MealAssemblyFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: MealAssemblyFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

// Meal plan item for individual food items in meals
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
  order_index: number;
}

// Consolidated meal item (alias for MealPlanItem)
export type ConsolidatedMealItem = MealPlanItem;

// Meal types
export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';

export const MEAL_TYPES: MealType[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];

export const MEAL_ORDER: Record<MealType, number> = {
  breakfast: 1,
  morning_snack: 2,
  lunch: 3,
  afternoon_snack: 4,
  dinner: 5,
  evening_snack: 6
};

export const MEAL_TIMES: Record<MealType, string> = {
  breakfast: '07:00',
  morning_snack: '10:00',
  lunch: '12:00',
  afternoon_snack: '15:00',
  dinner: '19:00',
  evening_snack: '21:00'
};

export interface ConsolidatedMeal {
  id: string;
  name: string;
  time?: string;
  type?: MealType;
  foods: MealAssemblyFood[];
  items?: MealPlanItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  // Aliases for backward compatibility
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface ConsolidatedMealPlan {
  id: string;
  patient_id: string;
  user_id?: string;
  calculation_id?: string;
  name: string;
  description?: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: ConsolidatedMeal[];
  created_at: string;
  updated_at: string;
}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  date?: string;
  culturalRules?: any;
  calculationId?: string; // Add missing property
}

export interface PDFMealPlanData {
  id: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: 'male' | 'female';
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: {
    id: string;
    name: string;
    time: string;
    items: {
      food_name: string;
      quantity: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }[];
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fats: number;
  }[];
}
