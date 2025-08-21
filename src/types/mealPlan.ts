
// ARQUIVO ATUALIZADO - Mantendo compatibilidade com código existente
// Importando tipos consolidados da fonte única de verdade

export * from './mealPlanTypes';

// Re-exportar tipos principais para compatibilidade
export type { 
  MealType,
  ConsolidatedMealPlan as MealPlan,
  ConsolidatedMeal as Meal,
  ConsolidatedMealItem as MealItem,
  PDFMealPlanData as MealPlanExportOptions,
  MealPlanGenerationParams,
  MealPlanGenerationResult as MealPlanResponse
} from './mealPlanTypes';

// Manter exports específicos para compatibilidade
export { 
  MEAL_TYPES,
  MEAL_ORDER,
  DEFAULT_MEAL_DISTRIBUTION,
  MEAL_TIMES
} from './mealPlanTypes';

// Aliases para compatibilidade com código existente
export const MEAL_NAMES = MEAL_TYPES;
export const BRAZILIAN_MEAL_FOOD_MAPPING = {
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

// Interface para compatibilidade com Patient type
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

// Interfaces adicionais para compatibilidade
export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionalTargets extends MacroTargets {}

export interface MealPlanFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  isTemplate?: boolean;
  limit?: number;
  date_from?: string;
}
