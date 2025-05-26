
export interface Food {
  id?: string;
  name: string;
  quantity?: number;
  unit?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  id?: string;
  name: string;
  time?: string;
  percentage?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  foods: Food[];
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFats?: number;
}

export interface MealPlan {
  id?: string;
  patient_id?: string;
  user_id?: string;
  calculation_id?: string;
  date: string;
  meals: Meal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
  updated_at?: string;
}

// Additional interfaces needed by components
export interface MealDistributionItem {
  id?: string;
  name: string;
  percent: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  suggestions?: string[];
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

export interface MealAssemblyFood {
  id: string;
  name: string;
  portion?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
  foods: any[];
  percentage: number;
  selected?: boolean;
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
