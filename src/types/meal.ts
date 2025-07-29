
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

export interface MealAssemblyFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion?: string;
  percentage?: number;
  selected?: boolean;
}

export interface MealFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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
  foods: MealFood[];
  [key: string]: any;
}

// Patient history interface for proper typing
export interface PatientHistoryData {
  lastMeasurement?: {
    date: string;
    weight: number;
    height: number;
  };
  anthropometryHistory?: Array<{
    date: string;
    weight: number;
    height: number;
    bmi: number;
  }>;
}
