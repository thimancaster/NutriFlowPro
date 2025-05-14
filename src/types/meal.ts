
// Meal and MealPlan related type definitions

export interface MealItem {
  id?: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  selected?: boolean;
}

export interface Meal {
  id?: string;
  name: string;
  time: string; // Changed from optional to required
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: MealItem[];
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface MealDistributionItem {
  id: string;
  name: string;
  percent: number;
  foods: any[];
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  suggestions?: string[]; // Add suggestions property
}

export interface MealPlan {
  id: string;
  user_id?: string;
  patient_id?: string;
  date: Date;
  meals: Meal[];
  mealDistribution?: Record<string, any>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
  updated_at?: string;
}
