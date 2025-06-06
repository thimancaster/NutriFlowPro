
export interface MealDistributionItem {
  name: string;
  percentage: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
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
  title: string; // Changed from 'name' to 'title'
  name?: string; // Add name as optional for backward compatibility
  patient_id: string;
  user_id: string;
  date: Date | string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: MealItem[];
  mealDistribution: Record<string, MealDistributionItem>;
}
