
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

// Aliases for compatibility
export const MEAL_NAMES = MEAL_TYPES;
export const MEAL_TIMES = MEAL_TYPES;

export interface MealPlan {
  id: string;
  user_id: string;
  patient_id: string;
  calculation_id?: string;
  date: string;
  meals: MealPlanMeal[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
  is_template?: boolean;
  day_of_week?: string;
  created_at?: string;
  updated_at?: string;
  items?: MealPlanItem[]; // Add items property for compatibility
}

export interface DetailedMealPlan extends MealPlan {
  patient?: Patient;
  items?: MealPlanItem[];
}

export interface MealPlanMeal {
  id: string;
  type: MealType;
  name: string;
  foods: MealPlanFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
}

export interface MealPlanFood {
  id: string;
  food_id?: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  order_index: number;
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  meal_type: MealType;
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

export interface MealPlanResponse {
  success: boolean;
  data?: MealPlan;
  error?: string;
}

export interface MealPlanListResponse {
  success: boolean;
  data?: MealPlan[];
  error?: string;
  total?: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Alias for compatibility
export interface NutritionalTargets extends MacroTargets {}

export interface MealPlanGenerationParams {
  userId: string;
  patientId: string;
  targets: MacroTargets;
  date?: string;
  mealTimeFoodMapping?: Record<string, string[]>;
}

export interface MealPlanFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  isTemplate?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: 'male' | 'female';
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Brazilian meal food mapping for cultural intelligence
export const BRAZILIAN_MEAL_FOOD_MAPPING: Record<MealType, string[]> = {
  cafe_da_manha: [
    'Pão francês', 'Café com leite', 'Frutas', 'Queijo branco', 
    'Manteiga', 'Aveia', 'Iogurte', 'Biscoito integral'
  ],
  lanche_manha: [
    'Banana', 'Maçã', 'Castanhas', 'Iogurte natural', 
    'Biscoito de aveia', 'Vitamina de frutas'
  ],
  almoco: [
    'Arroz branco', 'Feijão carioca', 'Frango grelhado', 'Salada verde',
    'Legumes refogados', 'Carne bovina', 'Peixe', 'Verduras'
  ],
  lanche_tarde: [
    'Pão integral', 'Queijo minas', 'Frutas da estação', 'Chá',
    'Biscoito integral', 'Iogurte com granola'
  ],
  jantar: [
    'Sopa de legumes', 'Salada', 'Peixe grelhado', 'Frango light',
    'Legumes cozidos', 'Arroz integral', 'Verduras refogadas'
  ],
  ceia: [
    'Leite morno', 'Chá calmante', 'Frutas leves', 'Iogurte desnatado',
    'Biscoito água e sal', 'Queijo cottage'
  ]
};
