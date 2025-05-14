
export interface MealItem {
  name: string;
  portion: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  selected?: boolean;
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: MealItem[];
}

export interface MealDistributionItem {
  id: string;
  name: string;
  order?: number;
  description?: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  percent: number;
  percentage?: number;  // For backward compatibility
  suggestions?: string[];
  foods?: MealFood[];
}

export interface MealFood {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  date: Date;
  meals: Meal[];
  mealDistribution?: MealDistributionItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: Date;
  updated_at?: Date;
}
