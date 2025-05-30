
// DEPRECATED: This file is being phased out in favor of modular structure
// All functions now redirect to the new modular implementations

import { 
  calculateTMB,
  calculateGET,
  calculateVET,
  validateNutritionInputs,
  mapProfileToCalculation
} from './nutritionCalculations';
import { calculateMacros } from './nutrition/macroCalculations';
import { 
  Profile, 
  ActivityLevel, 
  Objective
} from '@/types/consultation';

/**
 * DEPRECATED: Use calculateTMB from nutritionCalculations instead
 */
export const calculateBMR = (weight: number, height: number, age: number, sex: 'M' | 'F'): number => {
  const result = calculateTMB(weight, height, age, sex, 'magro');
  return result.tmb;
};

/**
 * DEPRECATED: Use calculateGET from nutritionCalculations instead
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return calculateGET(bmr, activityLevel, 'magro');
};

/**
 * DEPRECATED: Use calculateVET from nutritionCalculations instead
 */
export const applyObjectiveAdjustment = (tdee: number, objective: Objective, customVET?: number): number => {
  if (objective === 'personalizado' && customVET !== undefined && customVET > 0) {
    return customVET;
  }
  const result = calculateVET(tdee, activityLevel as any, objective, 'magro');
  return result.vet;
};

/**
 * DEPRECATED: Use calculateMacros from nutritionCalculations instead
 */
export const calculateMacros = (
  weight: number, 
  adjustedTDEE: number, 
  profile: Profile
): { protein: number; carbs: number; fat: number } => {
  const mappedProfile = mapProfileToCalculation(profile);
  const result = calculateMacros(adjustedTDEE, weight, 'manutenção', mappedProfile);
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

  const mappedProfile = mapProfileToCalculation(profile);
  const tmbResult = calculateTMB(weight, height, age, sex, mappedProfile);
  const get = calculateGET(tmbResult.tmb, activityLevel, mappedProfile);
  const vetResult = calculateVET(get, activityLevel, objective, mappedProfile);
  const adjustedTDEE = objective === 'personalizado' && customVET ? customVET : vetResult.vet;
  const macroResult = calculateMacros(adjustedTDEE, weight, objective, mappedProfile);

  return {
    bmr: Math.round(tmbResult.tmb),
    tdee: Math.round(get),
    adjustedTDEE: Math.round(adjustedTDEE),
    macros: {
      protein: macroResult.protein.grams,
      carbs: macroResult.carbs.grams,
      fat: macroResult.fat.grams
    }
  };
};
