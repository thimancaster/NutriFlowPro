// Re-export components from the contexts
export { AuthProvider, useAuth } from './auth/AuthContext';
export { PatientProvider, usePatient } from './patient/PatientContext';
export { MealPlanProvider } from './MealPlanContext';
export { ConsultationDataProvider, useConsultationData } from './ConsultationDataContext';
export { UnifiedNutritionProvider, useUnifiedNutrition } from './UnifiedNutritionContext';

// Re-export types for convenience
export type { AuthContextType, AuthState } from './auth/types';
