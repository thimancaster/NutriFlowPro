
// Patient types
export type { Patient, PatientGoals, AddressDetails } from './patient';
export type { PatientFilters } from './patient';

// Profile type for consultation
export interface Profile {
  id: string;
  name: string;
  type: 'eutrofico' | 'sobrepeso' | 'obeso' | 'magro';
  description?: string;
}

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

// Consultation and Appointment types
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity_level: string;
  objective: 'manutencao' | 'emagrecimento' | 'hipertrofia' | 'manutenção' | 'personalizado' | string;
  profile?: Profile;
  recommendations?: string;
  notes?: string;
  bmr?: number;
  tdee?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  created_at?: string;
  updated_at?: string;
  
  // Additional fields for E2E flow
  results?: {
    bmr: number;
    get: number;
    vet: number;
    adjustment: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  totalCalories?: number;
  goal?: string;
  patient?: {
    id: string;
    name: string;
    age?: number;
  };
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type AppointmentType = 'consulta' | 'retorno' | 'avaliacao' | 'urgencia';

export interface Appointment {
  id: string;
  patient_id: string;
  user_id?: string;
  appointment_type_id?: string;
  title?: string;
  type: string;
  status: AppointmentStatus;
  date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  recommendations?: string;
  created_at?: string;
  updated_at?: string;
  patient?: {
    id: string;
    name: string;
  };
  patientName?: string;
}

// Updated MealPlan type for backward compatibility
export interface MealPlan {
  id: string;
  name: string;
  user_id?: string;
  patient_id?: string;
  date?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  meals: MealPlanMeal[];
  notes?: string;
  created_at: string;
  updated_at: string;
  is_template?: boolean;
  calculation_id?: string;
  targets?: any;
}

export interface MealPlanMeal {
  id: string;
  name: string;
  type: string;
  foods: MealPlanFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

export interface MealPlanFood {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Patient Input for E2E flow
export interface PatientInput {
  id: string;
  sex: 'male' | 'female';
  gender?: 'M' | 'F';
  age: number;
  weight: number;
  height: number;
  objective: string;
  activityLevel: string;
  profile?: string;
}

// Calculation result interface
export interface CalculationResult {
  id: string;
  bmr: number;
  get: number;
  vet: number;
  tmb?: {
    value: number;
    formula: string;
  };
  gea?: number;
  adjustment?: number;
  formulaUsed?: string;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  macros: {
    protein: { grams: number; kcal: number; percentage: number; };
    carbs: { grams: number; kcal: number; percentage: number; };
    fat: { grams: number; kcal: number; percentage: number; };
  };
}
