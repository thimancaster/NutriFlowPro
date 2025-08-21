
// Tipos consolidados para plano alimentar - FONTE ÚNICA DE VERDADE

export type MealType = 
  | 'cafe_da_manha'
  | 'lanche_manha' 
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'ceia';

export const MEAL_TYPES: Record<MealType, string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã', 
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};

export const MEAL_ORDER: MealType[] = [
  'cafe_da_manha',
  'lanche_manha',
  'almoco', 
  'lanche_tarde',
  'jantar',
  'ceia'
];

// Distribuição padrão das refeições (ajustável)
export const DEFAULT_MEAL_DISTRIBUTION: Record<MealType, number> = {
  cafe_da_manha: 0.25, // 25%
  lanche_manha: 0.10,  // 10%
  almoco: 0.30,        // 30%
  lanche_tarde: 0.10,  // 10%
  jantar: 0.20,        // 20%
  ceia: 0.05           // 5%
};

// Horários sugeridos para cada refeição
export const MEAL_TIMES: Record<MealType, string> = {
  cafe_da_manha: '07:00',
  lanche_manha: '10:00',
  almoco: '12:30',
  lanche_tarde: '15:30',
  jantar: '19:00',
  ceia: '21:30'
};

export interface ConsolidatedMealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: ConsolidatedMeal[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsolidatedMeal {
  id: string;
  type: MealType;
  name: string;
  time: string;
  items: ConsolidatedMealItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface ConsolidatedMealItem {
  id: string;
  food_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index: number;
}

// Interface para geração de PDF (compatível com generateMealPlanPDF)
export interface PDFMealPlanData {
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  meals: PDFMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

export interface PDFMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  percent: number;
  suggestions: string[];
}

// Parâmetros para geração de plano alimentar
export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  date?: string;
  customDistribution?: Partial<Record<MealType, number>>;
}

export interface MealPlanGenerationResult {
  success: boolean;
  data?: ConsolidatedMealPlan;
  error?: string;
}
