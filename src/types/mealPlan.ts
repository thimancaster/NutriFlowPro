
import { 
  ConsolidatedMealPlan, 
  ConsolidatedMeal, 
  MEAL_TYPES,
  MealType,
  MealPlanGenerationParams as BaseMealPlanGenerationParams
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
  items: MealPlanFood[]; // Alias for compatibility
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface DetailedMealPlan extends Omit<ConsolidatedMealPlan, 'meals'> {
  meals: MealPlanMeal[];
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

export interface NutritionalTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealPlanFilters {
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  is_template?: boolean;
}

export interface MealPlanListResponse {
  data: ConsolidatedMealPlan[];
  count: number;
  success: boolean;
  error?: string;
}

// Generation interfaces with proper inheritance
export interface ExtendedMealPlanGenerationParams extends BaseMealPlanGenerationParams {
  date?: string;
  culturalRules?: any;
}

// Re-export from mealPlanTypes for convenience
export type MealPlanGenerationParams = BaseMealPlanGenerationParams;
export type MealPlan = ConsolidatedMealPlan;

// Export commonly used types
export type { ConsolidatedMealPlan, ConsolidatedMeal, MealType };
export { MEAL_TYPES };
