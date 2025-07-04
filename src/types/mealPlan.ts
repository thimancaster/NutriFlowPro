
// Consolidated and corrected meal plan types
export interface MealPlanFood {
  id: string;
  food_id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index?: number;
}

export interface MealPlanMeal {
  id: string;
  type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
  name: string;
  foods: MealPlanFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id?: string;
  calculation_id?: string;
  date: string;
  meals: MealPlanMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
  is_template?: boolean;
  day_of_week?: number;
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  meal_type: string;
  food_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface MealPlanFilters {
  patient_id?: string;
  date_from?: string;
  date_to?: string;
  is_template?: boolean;
  limit?: number;
}

export interface MealPlanResponse {
  success: boolean;
  data?: MealPlan;
  error?: string;
}

export interface MealPlanListResponse {
  success: boolean;
  data?: MealPlan[];
  total?: number;
  error?: string;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionalTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DetailedMealPlan extends MealPlan {
  items?: MealPlanItem[];
}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  targets: MacroTargets;
  date?: string;
  mealTimeFoodMapping?: Record<string, string[]>;
}

// Distribuição de refeições em ordem cronológica
export interface MealDistribution {
  breakfast: number;      // Café da Manhã - 07:00
  morning_snack: number;  // Lanche da Manhã - 10:00
  lunch: number;          // Almoço - 12:30
  afternoon_snack: number; // Lanche da Tarde - 15:30
  dinner: number;         // Jantar - 19:00
  evening_snack: number;  // Ceia - 21:30
}

export const DEFAULT_MEAL_DISTRIBUTION: MealDistribution = {
  breakfast: 0.25,        // 25% - Café da Manhã
  morning_snack: 0.10,    // 10% - Lanche da Manhã
  lunch: 0.30,            // 30% - Almoço
  afternoon_snack: 0.10,  // 10% - Lanche da Tarde
  dinner: 0.20,           // 20% - Jantar
  evening_snack: 0.05     // 5% - Ceia
};

// Ordem cronológica das refeições (importante para exibição)
export const MEAL_ORDER = [
  'breakfast',
  'morning_snack', 
  'lunch',
  'afternoon_snack',
  'dinner',
  'evening_snack'
] as const;

// Nomes das refeições em português
export const MEAL_NAMES: Record<string, string> = {
  breakfast: 'Café da Manhã',
  morning_snack: 'Lanche da Manhã',
  lunch: 'Almoço', 
  afternoon_snack: 'Lanche da Tarde',
  dinner: 'Jantar',
  evening_snack: 'Ceia'
};

// Horários das refeições
export const MEAL_TIMES: Record<string, string> = {
  breakfast: '07:00',
  morning_snack: '10:00', 
  lunch: '12:30',
  afternoon_snack: '15:30',
  dinner: '19:00',
  evening_snack: '21:30'
};
