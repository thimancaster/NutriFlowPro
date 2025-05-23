
export interface FoodItem {
  id: string;
  name: string;
  portion_size: number;
  portion_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  food_group: string;
  category: string;
  serving_suggestion?: string;
  meal_time?: string[];
}

export interface MealFood {
  food: FoodItem;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  date: string;
  meals: Meal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at: string;
  updated_at: string;
}

export interface MealDistribution {
  mealName: string;
  time: string;
  caloriePercentage: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
}

export interface MealPlanSettings {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  mealDistribution: MealDistribution[];
  patientPreferences?: {
    allergies?: string[];
    dislikes?: string[];
    preferences?: string[];
  };
}
