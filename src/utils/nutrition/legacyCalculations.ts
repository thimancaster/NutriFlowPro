
/**
 * Legacy calculation functions for backward compatibility
 * These maintain the old 7-parameter signature that existing code expects
 */

import { ActivityLevel, Objective } from '@/types/consultation';
import { calculateCompleteENP, ENPInputs } from './enpCalculations';
import { mapProfileToCalculation } from './macroCalculations';

export interface LegacyCalculationResult {
  tmb: number;
  vet: number;
  get: number;
  formulaUsed: string;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
  };
  proteinPerKg: number;
  recommendations?: string[];
  // Cache properties
  fromCache?: boolean;
  cacheAge?: number;
}

/**
 * Legacy function that maintains the 7-parameter signature
 */
export function calculateCompleteNutritionLegacy(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta'
): LegacyCalculationResult {
  // Map legacy profile to new format
  const mappedProfile = mapProfileToCalculation(
    profile === 'magro' ? 'eutrofico' : 
    profile === 'obeso' ? 'sobrepeso_obesidade' : 'atleta'
  );

  const enpInputs: ENPInputs = {
    weight,
    height,
    age,
    sex,
    activityLevel,
    objective,
    profile: profile === 'magro' ? 'eutrofico' : 
            profile === 'obeso' ? 'sobrepeso_obesidade' : 'atleta'
  };

  const enpResult = calculateCompleteENP(enpInputs);
  
  // Calculate percentages
  const totalKcal = enpResult.get;
  const proteinPercentage = Math.round((enpResult.macros.protein.kcal / totalKcal) * 100 * 100) / 100;
  const carbsPercentage = Math.round((enpResult.macros.carbs.kcal / totalKcal) * 100 * 100) / 100;
  const fatPercentage = Math.round((enpResult.macros.fat.kcal / totalKcal) * 100 * 100) / 100;
  
  const proteinPerKg = Math.round((enpResult.macros.protein.grams / weight) * 100) / 100;

  return {
    tmb: enpResult.tmb,
    vet: enpResult.get, // VET maps to GET in ENP
    get: enpResult.get,
    formulaUsed: 'Harris-Benedict Revisada',
    macros: {
      protein: {
        grams: enpResult.macros.protein.grams,
        kcal: enpResult.macros.protein.kcal,
        percentage: proteinPercentage
      },
      carbs: {
        grams: enpResult.macros.carbs.grams,
        kcal: enpResult.macros.carbs.kcal,
        percentage: carbsPercentage
      },
      fat: {
        grams: enpResult.macros.fat.grams,
        kcal: enpResult.macros.fat.kcal,
        percentage: fatPercentage
      }
    },
    proteinPerKg,
    recommendations: []
  };
}

/**
 * Legacy validation function
 */
export function validateLegacyParameters(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!weight || weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!height || height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!age || age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  if (!['M', 'F'].includes(sex)) {
    errors.push('Sexo deve ser M ou F');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
