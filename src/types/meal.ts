
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
  percentage: number;
  selected?: boolean;
  foods: any[];
  foodSuggestions?: string[];
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
  // Additional properties for compatibility with MealItem
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  proteinPercent?: number;
  carbsPercent?: number;
  fatPercent?: number;
  portion?: string;
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
  mealDistribution?: Record<string, MealDistributionItem>;
  title?: string;
  name?: string;
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

// Add the missing types needed by components
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
  time?: string;
  proteinPercent?: number;
  carbsPercent?: number;
  fatPercent?: number;
}

// Add MealItem type that was missing
export interface MealItem {
  id?: string;
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
  portion?: string;
  selected?: boolean;
  foods: any[];
  foodSuggestions?: string[];
}
