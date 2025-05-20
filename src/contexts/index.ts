
// Export all context providers for easier imports
export { AuthProvider } from './auth/AuthContext';
export { CalculatorProvider } from './calculator/CalculatorContext';
export { PatientProvider } from './patient/PatientContext';
export { ConsultationDataProvider } from './ConsultationDataContext';
export { MealPlanProvider } from './MealPlanContext';
export { ConsultationProvider } from './ConsultationContext';

// Export all hooks for accessing contexts
export { useAuth } from './auth/AuthContext';
export { useCalculator } from './calculator/CalculatorContext';
export { usePatient } from './patient/PatientContext';
export { useConsultationData } from './ConsultationDataContext';
export { useMealPlan } from './MealPlanContext';
export { useConsultation } from './ConsultationContext';
