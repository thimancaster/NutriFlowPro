
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
}

// Make sure Meal type has the required properties
export interface Meal {
  id: string;
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
}

// Add MealPlan type if not defined
export interface MealPlan {
  id: string;
  date: Date;
  meals: any[];
  mealDistribution: MealDistributionItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  patient_id?: string;
}
