export interface MealPlanExportOptions {
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    percent: number;
    suggestions: string[];
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  nutritionistName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  date?: string;
  notes?: string;
}