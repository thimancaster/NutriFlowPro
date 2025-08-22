
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

// Consultation and Appointment types
export interface ConsultationData {
  id?: string;
  patient_id?: string;
  date?: string;
  objective?: 'manutencao' | 'emagrecimento' | 'hipertrofia';
  profile?: 'eutrofico' | 'obeso_sobrepeso' | 'atleta';
  activityLevel?: 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo';
  totalCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  metrics?: {
    weight?: number;
    height?: number;
    bmi?: number;
    bodyFat?: number;
  };
  results?: any;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
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

// Legacy MealPlan type for backward compatibility
export interface MealPlan {
  id: string;
  patient_id: string;
  name: string;
  meals: any[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at: string;
  updated_at: string;
}
