
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
  type: 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia';
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

// Distribuição de refeições em ordem cronológica (ATUALIZADA PARA PADRÃO BRASILEIRO)
export interface MealDistribution {
  cafe_da_manha: number;      // Café da Manhã - 07:00
  lanche_manha: number;       // Lanche da Manhã - 10:00
  almoco: number;             // Almoço - 12:30
  lanche_tarde: number;       // Lanche da Tarde - 15:30
  jantar: number;             // Jantar - 19:00
  ceia: number;               // Ceia - 21:30
}

export const DEFAULT_MEAL_DISTRIBUTION: MealDistribution = {
  cafe_da_manha: 0.25,        // 25% - Café da Manhã
  lanche_manha: 0.10,         // 10% - Lanche da Manhã
  almoco: 0.30,               // 30% - Almoço
  lanche_tarde: 0.10,         // 10% - Lanche da Tarde
  jantar: 0.20,               // 20% - Jantar
  ceia: 0.05                  // 5% - Ceia
};

// Ordem cronológica das refeições (ATUALIZADA PARA PADRÃO BRASILEIRO)
export const MEAL_ORDER = [
  'cafe_da_manha',
  'lanche_manha', 
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia'
] as const;

// Nomes das refeições em português (PADRONIZADO)
export const MEAL_NAMES: Record<string, string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço', 
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia'
};

// Horários das refeições
export const MEAL_TIMES: Record<string, string> = {
  cafe_da_manha: '07:00',
  lanche_manha: '10:00', 
  almoco: '12:30',
  lanche_tarde: '15:30',
  jantar: '19:00',
  ceia: '21:30'
};

// Interface para regras culturais
export interface MealCulturalRule {
  id: string;
  meal_type: string;
  food_category: string;
  cultural_score: number;
  is_forbidden: boolean;
  reasoning?: string;
  created_at: string;
}

// Mapeamento inteligente de categorias de alimentos por refeição
export const BRAZILIAN_MEAL_FOOD_MAPPING: Record<string, string[]> = {
  cafe_da_manha: ['Cereais e derivados', 'Laticínios', 'Frutas', 'Pães e biscoitos'],
  lanche_manha: ['Frutas', 'Laticínios', 'Oleaginosas'],
  almoco: ['Carnes', 'Cereais e derivados', 'Leguminosas', 'Hortaliças', 'Óleos e gorduras'],
  lanche_tarde: ['Frutas', 'Laticínios', 'Pães e biscoitos'],
  jantar: ['Carnes', 'Cereais e derivados', 'Hortaliças', 'Óleos e gorduras'],
  ceia: ['Laticínios', 'Frutas']
};
