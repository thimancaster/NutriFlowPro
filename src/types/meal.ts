
export interface MealItem {
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
  selected?: boolean;
  portion?: string;
  suggestions?: string[];
}

export interface Meal {
  id?: string;
  name: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  foods: any[];
  selected?: boolean;
}

export interface MealDistributionItem {
  id: string;
  name: string;
  description?: string;
  time?: string;
  percent: number;
  percentage?: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  foods: any[];
  suggestions?: string[];
}

export interface MealPlan {
  id?: string;
  user_id?: string;
  patient_id?: string;
  date: Date | string;
  meals: MealItem[];
  mealDistribution?: Record<string, MealDistributionItem>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}
