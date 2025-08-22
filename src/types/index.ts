
// Patient types
export type { Patient, PatientGoals, AddressDetails } from './patient';
export type { PatientFilters } from './patient';

// Meal plan types - avoiding conflicts by using specific exports
export type { 
  MealDistributionItem,
  MealAssemblyFood,
  MealPlanMealType as Meal, // Renamed to avoid conflict
  MealPlanItem,
  ConsolidatedMealItem,
  MealType,
  ConsolidatedMeal,
  ConsolidatedMealPlan,
  MealPlanGenerationParams,
  MealPlanGenerationResult,
  PDFMeal,
  PDFMealPlanData,
  MealPlanExportOptions
} from './mealPlanTypes';

export { 
  MEAL_TYPES,
  MEAL_ORDER,
  MEAL_TIMES,
  DEFAULT_MEAL_DISTRIBUTION
} from './mealPlanTypes';
