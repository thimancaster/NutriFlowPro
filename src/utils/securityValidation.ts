
// Main security validation module - refactored for better organization
export { ValidationResult } from './validation/types';
export { rateLimiter } from './security/rateLimiter';
export { csrfProtection } from './security/csrfProtection';

import { validateFoodSearch, validateNotes } from './validation/formValidators';
import { validatePatient } from './validation/patientValidators';
import { validateCalculation } from './validation/calculationValidators';
import { validateMealPlan } from './validation/mealPlanValidators';

export const validateSecureForm = {
  foodSearch: validateFoodSearch,
  notes: validateNotes,
  patient: validatePatient,
  calculation: validateCalculation,
  mealPlan: validateMealPlan
};
