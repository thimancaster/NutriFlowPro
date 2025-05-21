
import { dbCache } from "./dbCache";
import { PatientService } from "./patient";
import { consultationService } from "./consultationService";
import * as MealPlanService from "./mealPlanService";

/**
 * Service to handle all database interactions
 * This acts as a facade for all the individual domain services
 */
export const DatabaseService = {
  // Patient-related operations
  savePatient: PatientService.savePatient,
  getPatient: PatientService.getPatient,
  
  // Consultation-related operations
  saveConsultation: consultationService.saveConsultation,
  updateConsultation: consultationService.updateConsultation, // Fixed method name
  getPatientConsultations: consultationService.getPatientConsultations,
  
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
