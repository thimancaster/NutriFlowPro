export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  date: string;
  meals: Meal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  items: MealItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface MealAssemblyFood {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}

export interface MealFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PatientHistoryData {
  lastMeasurement?: {
    date: string;
    weight: number;
    height: number;
  };
  anthropometryHistory: Array<{
    date: string;
    weight: number;
    height: number;
    bmi: number;
  }>;
}

export interface MealDistributionItem {
  id: string;
  name: string;
  time: string;
  percentage: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  proteinPercent: number;
  carbsPercent: number;
  fatPercent: number;
}
