
// Re-export components from the contexts
export { AuthProvider, useAuth } from './auth/AuthContext';
export { PatientProvider, usePatient } from './patient/PatientContext';
export { MealPlanProvider } from './MealPlanContext';
export { ConsultationProvider } from './ConsultationContext'; 
export { ConsultationDataProvider, useConsultationData } from './ConsultationDataContext';
export { ThemeProvider } from '@/hooks/theme/use-theme-provider';

// Re-export types for convenience
export type { AuthContextType, AuthState } from './auth/types';
