
import { dbCache } from "./dbCache";
import { PatientService } from "./patient";
import { ConsultationService } from "./consultationService";
import { MealPlanService } from "./mealPlanService";

/**
 * Service to handle all database interactions
 * This acts as a facade for all the individual domain services
 */
export const DatabaseService = {
  // Patient-related operations
  savePatient: PatientService.savePatient,
  getPatient: PatientService.getPatient,
  
  // Consultation-related operations
  saveConsultation: ConsultationService.saveConsultation,
  autoSaveConsultation: ConsultationService.autoSaveConsultation,
  updateConsultationStatus: ConsultationService.updateConsultationStatus,
  getPatientConsultations: ConsultationService.getPatientConsultations,
  
  // Meal plan-related operations
  saveMealPlan: MealPlanService.saveMealPlan,
  getPatientMealPlans: MealPlanService.getPatientMealPlans,
  
  /**
   * Clear all database service caches
   */
  clearCache: (): void => {
    Object.values(dbCache.KEYS).forEach(keyPrefix => {
      dbCache.invalidate(keyPrefix);
    });
  }
};
