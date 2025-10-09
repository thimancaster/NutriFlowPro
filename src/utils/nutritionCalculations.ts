/**
 * NUTRITION CALCULATIONS - REDIRECT TO OFFICIAL ENGINE
 * 
 * This file serves as a compatibility layer, redirecting all calculation
 * requests to the official calculation engine in officialCalculations.ts
 * 
 * All new code should import directly from:
 * @/utils/nutrition/official/officialCalculations
 */

export {
  calculateComplete_Official as calculateCompleteNutrition,
  calculateTMB_Official as calculateTMB,
  calculateGET_Official as calculateGET,
  calculateVET_Official as calculateVET,
  calculateMacros_ByGramsPerKg as calculateMacros,
  validateCalculationInputs as validateInputs,
  validateCalculationInputs as validateENPData,
  validateCalculationInputs as validateAllParameters,
  type CalculationInputs,
  type CalculationResult,
  type CalculationResult as CompleteNutritionResult,
  type MacroResult,
  ACTIVITY_FACTORS,
  CALORIC_VALUES,
  OBJECTIVE_ADJUSTMENTS
} from './nutrition/official/officialCalculations';

// Re-export types for backward compatibility
export type { 
  ActivityLevel, 
  Objective, 
  PatientProfile 
} from './nutrition/official/officialCalculations';

// Anthropometry calculations
export * from './nutrition/anthropometryCalculations';
