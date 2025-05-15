
// Add this if it doesn't exist already
export interface MealDistributionItem {
  id: string;
  name: string;
  percent: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  foods: any[];
  description?: string;
  time?: string;
  percentage?: number;
  suggestions?: string[];
}

// Make sure Meal type has the required properties
export interface Meal {
  id?: string;
  name: string;
  time: string; // Changed from optional to required
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  foods: any[];
}

// Add MealPlan type if not defined
export interface MealPlan {
  id?: string;
  date: Date | string;
  meals: any[];
  mealDistribution?: Record<string, MealDistributionItem>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  patient_id?: string;
  user_id?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}
