/**
 * CONTEXTOS UNIFICADOS - ARQUITETURA PÓS-REFATORAÇÃO
 * 
 * Sistema de contextos limpo e organizado após unificação completa.
 * Todos os workflows antigos foram consolidados em ClinicalWorkflowContext.
 */

// Contextos ativos do sistema unificado
export { AuthProvider, useAuth } from './auth/AuthContext';
export { PatientProvider, usePatient } from './patient/PatientContext';
export { MealPlanProvider, useMealPlan } from './MealPlanContext';
export { ConsultationDataProvider, useConsultationData } from './ConsultationDataContext';
export { ClinicalWorkflowProvider, useClinicalWorkflow } from './ClinicalWorkflowContext';
