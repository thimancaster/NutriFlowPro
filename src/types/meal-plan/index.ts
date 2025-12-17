/**
 * CANONICAL MEAL PLAN TYPES
 * Single source of truth for all meal plan related types
 * All components should import from this file
 */

// ============== CORE ITEM TYPES ==============

/**
 * Individual food item within a meal
 * Represents a single food entry with calculated nutritional values
 */
export interface MealItem {
  id: string;
  alimento_id: string;
  nome: string;
  quantidade: number; // Multiplier of standard measure
  medida_utilizada: string;
  peso_total_g: number;
  kcal_calculado: number;
  ptn_g_calculado: number;
  cho_g_calculado: number;
  lip_g_calculado: number;
}

/**
 * Alias for MealItem with English field names (for interoperability)
 */
export interface MealItemEnglish {
  id: string;
  food_id: string;
  name: string;
  quantity: number;
  unit: string;
  weight_g: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ============== MEAL TYPES ==============

/**
 * A complete meal with items and nutritional targets
 */
export interface Meal {
  id: string;
  nome_refeicao: string;
  tipo: MealType;
  horario_sugerido?: string;
  items: MealItem[];
  // Calculated totals
  kcal_total: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
  // Target values
  alvo_kcal: number;
  alvo_ptn_g: number;
  alvo_cho_g: number;
  alvo_lip_g: number;
}

/**
 * Meal type identifiers (Portuguese keys for UI)
 */
export type MealType = 
  | 'cafe_manha'
  | 'lanche_manha'
  | 'almoco'
  | 'lanche_tarde'
  | 'jantar'
  | 'ceia';

/**
 * Meal type identifiers (English keys for database)
 */
export type MealTypeEnglish = 
  | 'breakfast'
  | 'morning_snack'
  | 'lunch'
  | 'afternoon_snack'
  | 'dinner'
  | 'evening_snack';

// ============== MEAL PLAN TYPES ==============

/**
 * Complete meal plan with all meals and metadata
 */
export interface MealPlan {
  id: string;
  patient_id: string;
  user_id: string;
  date: string;
  name?: string;
  description?: string;
  // Meals
  meals: Meal[];
  // Total values
  total_kcal: number;
  total_ptn_g: number;
  total_cho_g: number;
  total_lip_g: number;
  // Target values
  target_kcal?: number;
  target_ptn_g?: number;
  target_cho_g?: number;
  target_lip_g?: number;
  // Metadata
  notes?: string;
  is_template?: boolean;
  calculation_id?: string;
  created_at: string;
  updated_at: string;
}

// ============== NUTRITIONAL TARGETS ==============

/**
 * Daily nutritional targets
 */
export interface NutritionalTargets {
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

/**
 * Calculated nutritional totals
 */
export interface NutritionalTotals {
  kcal: number;
  ptn_g: number;
  cho_g: number;
  lip_g: number;
}

// ============== CONSTANTS ==============

/**
 * Default meal distribution percentages
 */
export const DEFAULT_MEAL_DISTRIBUTION: Record<MealType, number> = {
  cafe_manha: 0.25,
  lanche_manha: 0.10,
  almoco: 0.30,
  lanche_tarde: 0.10,
  jantar: 0.20,
  ceia: 0.05,
};

/**
 * Meal type labels in Portuguese
 */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  cafe_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
};

/**
 * Default meal schedule
 */
export const MEAL_SCHEDULES: Record<MealType, string> = {
  cafe_manha: '07:00',
  lanche_manha: '10:00',
  almoco: '12:30',
  lanche_tarde: '15:30',
  jantar: '19:00',
  ceia: '21:30',
};

/**
 * Ordered list of meal types
 */
export const MEAL_ORDER: MealType[] = [
  'cafe_manha',
  'lanche_manha',
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia',
];

// ============== MAPPING UTILITIES ==============

/**
 * Map Portuguese meal type to English
 */
export const mealTypeToEnglish: Record<MealType, MealTypeEnglish> = {
  cafe_manha: 'breakfast',
  lanche_manha: 'morning_snack',
  almoco: 'lunch',
  lanche_tarde: 'afternoon_snack',
  jantar: 'dinner',
  ceia: 'evening_snack',
};

/**
 * Map English meal type to Portuguese
 */
export const mealTypeToPortuguese: Record<MealTypeEnglish, MealType> = {
  breakfast: 'cafe_manha',
  morning_snack: 'lanche_manha',
  lunch: 'almoco',
  afternoon_snack: 'lanche_tarde',
  dinner: 'jantar',
  evening_snack: 'ceia',
};

// ============== HELPER FUNCTIONS ==============

/**
 * Calculate totals for a meal from its items
 */
export function calculateMealTotals(items: MealItem[]): NutritionalTotals {
  return items.reduce(
    (acc, item) => ({
      kcal: acc.kcal + item.kcal_calculado,
      ptn_g: acc.ptn_g + item.ptn_g_calculado,
      cho_g: acc.cho_g + item.cho_g_calculado,
      lip_g: acc.lip_g + item.lip_g_calculado,
    }),
    { kcal: 0, ptn_g: 0, cho_g: 0, lip_g: 0 }
  );
}

/**
 * Calculate totals for a meal plan from its meals
 */
export function calculatePlanTotals(meals: Meal[]): NutritionalTotals {
  return meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + meal.kcal_total,
      ptn_g: acc.ptn_g + meal.ptn_g,
      cho_g: acc.cho_g + meal.cho_g,
      lip_g: acc.lip_g + meal.lip_g,
    }),
    { kcal: 0, ptn_g: 0, cho_g: 0, lip_g: 0 }
  );
}

/**
 * Create initial meals structure from targets
 */
export function createInitialMeals(targets: NutritionalTargets): Meal[] {
  return MEAL_ORDER.map((tipo) => ({
    id: tipo,
    nome_refeicao: MEAL_TYPE_LABELS[tipo],
    tipo,
    horario_sugerido: MEAL_SCHEDULES[tipo],
    items: [],
    kcal_total: 0,
    ptn_g: 0,
    cho_g: 0,
    lip_g: 0,
    alvo_kcal: Math.round(targets.kcal * DEFAULT_MEAL_DISTRIBUTION[tipo]),
    alvo_ptn_g: Math.round(targets.ptn_g * DEFAULT_MEAL_DISTRIBUTION[tipo]),
    alvo_cho_g: Math.round(targets.cho_g * DEFAULT_MEAL_DISTRIBUTION[tipo]),
    alvo_lip_g: Math.round(targets.lip_g * DEFAULT_MEAL_DISTRIBUTION[tipo]),
  }));
}

/**
 * Generate unique item ID
 */
export function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
