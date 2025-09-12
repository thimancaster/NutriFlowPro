/**
 * LEGACY WRAPPERS - MIGRATION COMPATIBILITY
 * 
 * These wrappers redirect legacy calculation calls to the official system.
 * They maintain backward compatibility while ensuring all calculations
 * use the single source of truth in officialCalculations.ts
 * 
 * [DEPRECATED] - These functions exist only for migration compatibility.
 * All new code should use officialCalculations.ts directly.
 */

import {
  calculateComplete_Official,
  calculateTMB_Official,
  type CalculationInputs,
  type CalculationResult,
  ACTIVITY_FACTORS,
  CALORIC_VALUES,
  OBJECTIVE_ADJUSTMENTS
} from './official/officialCalculations';

// Legacy type mapping for backward compatibility
const mapLegacyProfile = (profile: string): 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' => {
  switch (profile.toLowerCase()) {
    case 'magro':
    case 'normal':
    case 'eutrofico':
      return 'eutrofico';
    case 'sobrepeso':
    case 'obeso':
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    case 'atleta':
      return 'atleta';
    default:
      return 'eutrofico';
  }
};

const mapLegacyObjective = (objective: string): 'emagrecimento' | 'manutenção' | 'hipertrofia' => {
  switch (objective.toLowerCase()) {
    case 'emagrecimento':
    case 'perda_peso':
    case 'weight_loss':
      return 'emagrecimento';
    case 'hipertrofia':
    case 'ganho_massa':
    case 'bulk':
      return 'hipertrofia';
    case 'manutencao':
    case 'manutenção':
    case 'maintenance':
    default:
      return 'manutenção';
  }
};

/**
 * [DEPRECATED] Legacy TMB calculation wrapper
 * Redirects to official TMB calculation
 */
export function calculateTMB(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  profile: string
) {
  console.warn('[DEPRECATED] calculateTMB - Use calculateTMB_Official from officialCalculations.ts');
  
  const mappedProfile = mapLegacyProfile(profile);
  const result = calculateTMB_Official(weight, height, age, sex, mappedProfile);
  
  return {
    tmb: result.value,
    formula: result.formula,
    details: {
      weight,
      height,
      age,
      sex,
      profile
    }
  };
}

/**
 * [DEPRECATED] Legacy complete nutrition calculation wrapper
 */
export function calculateCompleteNutrition(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string
): any {
  console.warn('[DEPRECATED] calculateCompleteNutrition - Use calculateComplete_Official from officialCalculations.ts');
  
  // Default macro inputs for legacy compatibility
  const defaultMacroInputs = {
    proteinPerKg: profile === 'atleta' ? 2.0 : profile === 'obeso' ? 1.2 : 1.6,
    fatPerKg: profile === 'atleta' ? 1.2 : 1.0
  };
  
  const inputs: CalculationInputs = {
    weight,
    height,
    age,
    gender: sex,
    profile: mapLegacyProfile(profile),
    activityLevel: activityLevel as any,
    objective: mapLegacyObjective(objective),
    macroInputs: defaultMacroInputs
  };
  
  const result = calculateComplete_Official(inputs);
  
  // Convert to legacy format
  return {
    tmb: result.tmb.value,
    get: result.get,
    vet: result.vet,
    macros: {
      protein: {
        grams: result.macros.protein.grams,
        kcal: result.macros.protein.kcal,
        percentage: result.macros.protein.percentage
      },
      carbs: {
        grams: result.macros.carbs.grams,
        kcal: result.macros.carbs.kcal,
        percentage: result.macros.carbs.percentage
      },
      fat: {
        grams: result.macros.fat.grams,
        kcal: result.macros.fat.kcal,
        percentage: result.macros.fat.percentage
      }
    },
    proteinPerKg: result.proteinPerKg,
    formulaUsed: result.tmb.formula,
    recommendations: result.calculationOrder
  };
}

/**
 * [DEPRECATED] Legacy constants - redirect to official values
 */
export { ACTIVITY_FACTORS, CALORIC_VALUES, OBJECTIVE_ADJUSTMENTS };

// Legacy aliases for backward compatibility
export const ACTIVITY_FACTORS_LEGACY = ACTIVITY_FACTORS;
export const PROTEIN_RATIOS_LEGACY = {
  eutrofico: 1.6,
  sobrepeso_obesidade: 1.2,
  atleta: 2.0,
  magro: 1.6,
  obeso: 1.2
};
export const OBJECTIVE_FACTORS_LEGACY = OBJECTIVE_ADJUSTMENTS;

/**
 * [DEPRECATED] Legacy macro calculation wrapper
 */
export function calculateMacros(
  vet: number,
  weight: number,
  objective: string,
  profile: string,
  customPercentages?: any
) {
  console.warn('[DEPRECATED] calculateMacros - Use calculateMacros_ByGramsPerKg or calculateMacros_ByPercentages from officialCalculations.ts');
  
  if (customPercentages) {
    // Use percentage method
    const proteinKcal = (vet * customPercentages.protein) / 100;
    const carbsKcal = (vet * customPercentages.carbs) / 100;
    const fatKcal = (vet * customPercentages.fat) / 100;
    
    return {
      protein: {
        grams: Math.round(proteinKcal / 4),
        kcal: Math.round(proteinKcal),
        percentage: customPercentages.protein
      },
      carbs: {
        grams: Math.round(carbsKcal / 4),
        kcal: Math.round(carbsKcal),
        percentage: customPercentages.carbs
      },
      fat: {
        grams: Math.round(fatKcal / 9),
        kcal: Math.round(fatKcal),
        percentage: customPercentages.fat
      },
      proteinPerKg: Math.round((proteinKcal / 4) / weight * 100) / 100
    };
  }
  
  // Use default g/kg method - delegate to official system
  const defaultRatios = PROTEIN_RATIOS_LEGACY[mapLegacyProfile(profile) as keyof typeof PROTEIN_RATIOS_LEGACY] || 1.6;
  
  const inputs: CalculationInputs = {
    weight,
    height: 170, // dummy value
    age: 30,     // dummy value
    gender: 'M', // dummy value
    profile: mapLegacyProfile(profile),
    activityLevel: 'moderado',
    objective: mapLegacyObjective(objective),
    macroInputs: {
      proteinPerKg: defaultRatios,
      fatPerKg: 1.0
    }
  };
  
  const result = calculateComplete_Official(inputs);
  
  return {
    protein: {
      grams: result.macros.protein.grams,
      kcal: result.macros.protein.kcal,
      percentage: result.macros.protein.percentage
    },
    carbs: {
      grams: result.macros.carbs.grams,
      kcal: result.macros.carbs.kcal,
      percentage: result.macros.carbs.percentage
    },
    fat: {
      grams: result.macros.fat.grams,
      kcal: result.macros.fat.kcal,
      percentage: result.macros.fat.percentage
    },
    proteinPerKg: result.proteinPerKg || defaultRatios
  };
}

/**
 * MIGRATION DEPRECATION WARNINGS
 */
export const MIGRATION_WARNINGS = {
  TMB_CALCULATIONS: 'Use calculateTMB_Official from officialCalculations.ts',
  MACRO_CALCULATIONS: 'Use calculateMacros_ByGramsPerKg or calculateMacros_ByPercentages from officialCalculations.ts',
  COMPLETE_NUTRITION: 'Use calculateComplete_Official from officialCalculations.ts',
  HOOKS: 'Use useOfficialCalculations hook instead of legacy calculation hooks'
};