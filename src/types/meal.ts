
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
  suggestions?: string[];
}

// Make sure Meal type has the required properties
export interface Meal {
  id?: string;
  name: string;
  time: string;
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
  id: string;
  user_id?: string;
  patient_id?: string;
  consultation_id?: string;
  date: Date;
  meals: Meal[];
  mealDistribution: Record<string, MealDistributionItem>; // Changed from array to record
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
  updated_at?: string;
}
