
import { dbCache } from "./dbCache";
import { PatientService } from "./patient";
import { consultationService } from "./consultationService";
import * as mealPlanService from '@/services/mealPlanService';

/**
 * Service to handle all database interactions
 * This acts as a facade for all the individual domain services
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
  saveMealPlan: mealPlanService.saveMealPlan,
  getPatientMealPlans: mealPlanService.getPatientMealPlans,
  getMealPlan: async (planId: string, userId: string) => {
    return mealPlanService.getMealPlanById(planId, userId);
  },
  
  /**
   * Clear all database service caches
   */
  clearCache: (): void => {
    Object.values(dbCache.KEYS).forEach(keyPrefix => {
      dbCache.invalidate(keyPrefix);
    });
  }
};
