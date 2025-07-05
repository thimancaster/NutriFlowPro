
import { PatientService } from "./patient";
import { consultationService } from "./consultationService";
import { MealPlanService } from './mealPlanService';

/**
 * Service to handle all database interactions
 * This acts as a facade for all the individual domain services
 * Cache is now handled by React Query instead of localStorage
 */
export const DatabaseService = {
  // Patient-related operations
  savePatient: PatientService.savePatient,
  getPatient: PatientService.getPatient,
  getPatients: PatientService.getPatients,
  updatePatient: PatientService.updatePatient,
  updatePatientStatus: PatientService.updatePatientStatus,
  deletePatient: PatientService.deletePatient,
  
  // Consultation-related operations
  saveConsultation: consultationService.saveConsultation,
  updateConsultation: consultationService.updateConsultation,
  getPatientConsultations: consultationService.getPatientConsultations,
  getConsultation: consultationService.getConsultation,
  
  // Meal plan-related operations
  saveMealPlan: MealPlanService.createMealPlan,
  getPatientMealPlans: (patientId: string, userId: string) => 
    MealPlanService.getMealPlans(userId, { patient_id: patientId }),
  getMealPlan: async (planId: string) => {
    const result = await MealPlanService.getMealPlan(planId);
    return result;
  }
};
