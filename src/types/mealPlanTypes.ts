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

export interface ConsolidatedMeal {
  id: string;
  name: string;
  time: string;
  foods: MealAssemblyFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface ConsolidatedMealPlan {
  id: string;
  patient_id: string;
  name: string;
  description?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: ConsolidatedMeal[];
  created_at: string;
  updated_at: string;
}
