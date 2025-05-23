
// Export all context providers
export { AuthProvider } from './auth/AuthContext';
export { PatientProvider } from './patient/PatientContext';
export { ConsultationDataProvider } from './ConsultationDataContext';
export { MealPlanProvider } from './MealPlanContext';
export { ConsultationProvider } from './ConsultationContext';
export { ClinicalProvider } from './ClinicalContext';

// Export hooks for accessing contexts
export { useAuth } from './auth/AuthContext';
export { usePatient } from './patient/PatientContext';
export { useConsultationData } from './ConsultationDataContext';
export { useMealPlan } from './MealPlanContext';
export { useConsultation } from './ConsultationContext';
export { useClinical } from './ClinicalContext';
