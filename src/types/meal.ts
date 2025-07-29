
export interface MealDistributionItem {
  id: string;
  name: string;
  percent: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions: string[];
}

export interface MealItem {
  mealNumber?: number;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  percentage: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  foodSuggestions?: string[];
  foods: any[];
}

export interface MealPlan {
  id: string;
  title: string;
  name?: string;
  patient_id: string;
  user_id: string;
  date: Date | string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: MealItem[];
  notes?: string;
  mealDistribution?: Record<string, MealDistributionItem>;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: any[];
  [key: string]: any;
}
