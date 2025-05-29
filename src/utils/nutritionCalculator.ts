
// DEPRECATED: This file is being phased out in favor of modular structure
// All functions now redirect to the new modular implementations

import { 
  calculateTMB,
  calculateGET,
  calculateVET,
  calculateMacrosByProfile,
  validateNutritionInputs
} from './nutritionCalculations';
import { 
  Profile, 
  ActivityLevel, 
  Objective
} from '@/types/consultation';

/**
 * DEPRECATED: Use calculateTMB from nutritionCalculations instead
 */
export const calculateBMR = (weight: number, height: number, age: number, sex: 'M' | 'F'): number => {
  return calculateTMB(weight, height, age, sex, 'eutrofico');
};

/**
 * DEPRECATED: Use calculateGET from nutritionCalculations instead
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return calculateGET(bmr, activityLevel, 'eutrofico');
};

/**
 * DEPRECATED: Use calculateVET from nutritionCalculations instead
 */
export const applyObjectiveAdjustment = (tdee: number, objective: Objective, customVET?: number): number => {
  if (objective === 'personalizado' && customVET !== undefined && customVET > 0) {
    return customVET;
  }
  return calculateVET(tdee, objective);
};

/**
 * DEPRECATED: Use calculateMacrosByProfile from nutritionCalculations instead
 */
export const calculateMacros = (
  weight: number, 
  adjustedTDEE: number, 
  profile: Profile
): { protein: number; carbs: number; fat: number } => {
  const result = calculateMacrosByProfile(profile, weight, adjustedTDEE, 'manutenção');
  return {
    protein: result.protein.grams,
    carbs: result.carbs.grams,
    fat: result.fat.grams
  };
};

/**
 * DEPRECATED: Use calculateCompleteNutrition from nutritionCalculations instead
 */
export const calculateNutrition = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile,
  customVET?: number
): {
  bmr: number;
  tdee: number;
  adjustedTDEE: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
} => {
  const validationError = validateNutritionInputs(weight, height, age);
  if (validationError) {
    throw new Error(validationError);
  }

  const bmr = calculateTMB(weight, height, age, sex, profile);
  const tdee = calculateGET(bmr, activityLevel, profile);
  const adjustedTDEE = objective === 'personalizado' && customVET ? customVET : calculateVET(tdee, objective);
  const macroResult = calculateMacrosByProfile(profile, weight, adjustedTDEE, objective);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    adjustedTDEE: Math.round(adjustedTDEE),
    macros: {
      protein: macroResult.protein.grams,
      carbs: macroResult.carbs.grams,
      fat: macroResult.fat.grams
    }
  };
};
