
import { 
  ConsolidatedMealPlan, 
  ConsolidatedMeal, 
  MEAL_TYPES,
  MealType 
} from './mealPlanTypes';

// Legacy interfaces for backward compatibility
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
}

export interface MealPlanMeal {
  id: string;
  type: MealType;
  name: string;
  time?: string;
  foods: MealPlanFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface DetailedMealPlan extends Omit<ConsolidatedMealPlan, 'meals' | 'day_of_week'> {
  meals: MealPlanMeal[];
  day_of_week?: number; // Changed to number to match ConsolidatedMealPlan
}

// Nutrition calculation interfaces
export interface MacroTargets {
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
}

export interface NutritionalData {
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  culturalRules?: any;
}

export interface MealPlanFilters {
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  is_template?: boolean;
}

// Generation interfaces with proper inheritance
export interface ExtendedMealPlanGenerationParams {
  userId: string;
  patientId: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  date?: string;
  culturalRules?: any;
  targets?: MacroTargets; // Use our own MacroTargets interface
}

// Export commonly used types
export type { ConsolidatedMealPlan, ConsolidatedMeal, MealType };
export { MEAL_TYPES };
