/**
 * DEPRECATED CALCULATION SYSTEMS - MIGRATION REDIRECTS
 * 
 * This file handles the deprecation of old calculation systems and redirects
 * all function calls to the official calculation engine to ensure consistency.
 * 
 * ⚠️ ALL FUNCTIONS IN THIS FILE ARE DEPRECATED ⚠️
 * They exist only for backward compatibility during migration.
 * New code should use officialCalculations.ts directly.
 */

import {
  calculateComplete_Official,
  calculateTMB_Official,
  calculateGET_Official,
  calculateVET_Official,
  calculateMacros_ByGramsPerKg,
  type CalculationInputs
} from './official/officialCalculations';

// =====================================
// DEPRECATION WARNINGS
// =====================================

const logDeprecationWarning = (oldFunction: string, newFunction: string) => {
  console.warn(`
🚨 DEPRECATED FUNCTION USED: ${oldFunction}

This function is deprecated and will be removed in a future version.
Please update your code to use: ${newFunction}

Migration Guide: See MIGRATION_NOTES.md for detailed instructions.
  `);
};

// =====================================
// TMB CALCULATIONS - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy TMB calculation
 * @deprecated Use calculateTMB_Official from officialCalculations.ts
 */
export const calculateTMB_ENP = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
) => {
  logDeprecationWarning('calculateTMB_ENP', 'calculateTMB_Official');
  const result = calculateTMB_Official(weight, height, age, sex, 'eutrofico');
  return result.value;
};

/**
 * [DEPRECATED] Legacy Harris-Benedict wrapper
 * @deprecated Use calculateTMB_Official from officialCalculations.ts
 */
export const calculateTMB_HarrisBenedictRevisada = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
) => {
  logDeprecationWarning('calculateTMB_HarrisBenedictRevisada', 'calculateTMB_Official');
  const result = calculateTMB_Official(weight, height, age, sex, 'eutrofico');
  return result.value;
};

// =====================================
// GET/GEA CALCULATIONS - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy GEA calculation
 * @deprecated Use calculateGET_Official from officialCalculations.ts
 */
export const calculateGEA_ENP = (
  tmb: number,
  activityLevel: string
) => {
  logDeprecationWarning('calculateGEA_ENP', 'calculateGET_Official');
  return calculateGET_Official(tmb, activityLevel as any);
};

/**
 * [DEPRECATED] Legacy GET calculation
 * @deprecated Use calculateGET_Official from officialCalculations.ts
 */
export const calculateGET_ENP = (
  gea: number,
  objective: string
) => {
  logDeprecationWarning('calculateGET_ENP', 'calculateVET_Official');
  return calculateVET_Official(gea, objective as any);
};

// =====================================
// MACRO CALCULATIONS - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy macro calculation
 * @deprecated Use calculateMacros_ByGramsPerKg from officialCalculations.ts
 */
export const calculateMacros_ENP = (
  get: number,
  weight: number,
  objective: string,
  profile: string
) => {
  logDeprecationWarning('calculateMacros_ENP', 'calculateMacros_ByGramsPerKg');
  
  // Default protein ratios for compatibility
  const proteinRatios = {
    eutrofico: 1.6,
    atleta: 2.0,
    sobrepeso_obesidade: 1.2
  };
  
  const mappedProfile = profile === 'magro' ? 'eutrofico' : 
                       profile === 'obeso' ? 'sobrepeso_obesidade' : 
                       profile as keyof typeof proteinRatios;
  
  const proteinPerKg = proteinRatios[mappedProfile] || 1.6;
  
  return calculateMacros_ByGramsPerKg(get, weight, {
    proteinPerKg,
    fatPerKg: 1.0
  });
};

// =====================================
// COMPLETE CALCULATION - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy complete calculation
 * @deprecated Use calculateComplete_Official from officialCalculations.ts
 */
export const calculateCompleteENP = (inputs: any) => {
  logDeprecationWarning('calculateCompleteENP', 'calculateComplete_Official');
  
  // Map legacy inputs to official format
  const officialInputs: CalculationInputs = {
    weight: inputs.weight,
    height: inputs.height,
    age: inputs.age,
    gender: inputs.sex,
    profile: inputs.profile === 'magro' ? 'eutrofico' : 
             inputs.profile === 'obeso' ? 'sobrepeso_obesidade' : 
             inputs.profile,
    activityLevel: inputs.activityLevel,
    objective: inputs.objective,
    macroInputs: {
      proteinPerKg: inputs.profile === 'atleta' ? 2.0 : 1.6,
      fatPerKg: 1.0
    }
  };
  
  const result = calculateComplete_Official(officialInputs);
  
  // Map back to legacy format
  return {
    tmb: result.tmb.value,
    gea: result.get,
    get: result.vet,
    macros: result.macros
  };
};

// =====================================
// VALIDATION - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy validation
 * @deprecated Use validateCalculationInputs from officialCalculations.ts
 */
export const validateENPParameters = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string
) => {
  logDeprecationWarning('validateENPParameters', 'validateCalculationInputs');
  
  const errors: string[] = [];
  
  if (!weight || weight <= 0) errors.push('Peso inválido');
  if (!height || height <= 0) errors.push('Altura inválida');
  if (!age || age <= 0) errors.push('Idade inválida');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// =====================================
// CONSTANTS - DEPRECATED
// =====================================

/**
 * [DEPRECATED] Legacy constants
 * @deprecated Use constants from officialCalculations.ts
 */
export const DEPRECATED_CONSTANTS = {
  ACTIVITY_FACTORS: {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9
  },
  CALORIE_VALUES: {
    protein: 4,
    carbs: 4,
    fat: 9
  },
  PROTEIN_RATIOS: {
    eutrofico: 1.6,
    sobrepeso_obesidade: 1.2,
    atleta: 2.0
  },
  LIPID_RATIOS: {
    eutrofico: 1.0,
    sobrepeso_obesidade: 1.0,
    atleta: 1.2
  }
};

// =====================================
// MIGRATION HELPER
// =====================================

/**
 * Migration helper function to identify deprecated usage
 */
export const identifyDeprecatedUsage = () => {
  const deprecatedFunctions = [
    'calculateTMB_ENP',
    'calculateGEA_ENP', 
    'calculateGET_ENP',
    'calculateMacros_ENP',
    'calculateCompleteENP',
    'validateENPParameters'
  ];
  
  console.group('🔄 MIGRATION CHECKLIST');
  console.log('The following functions are deprecated and should be replaced:');
  deprecatedFunctions.forEach(fn => {
    console.log(`❌ ${fn} → Use officialCalculations.ts equivalent`);
  });
  console.log('\n✅ Recommended: Use useOfficialCalculations hook');
  console.log('📖 See MIGRATION_NOTES.md for complete guide');
  console.groupEnd();
};

// =====================================
// EXPORT DEPRECATION NOTICES
// =====================================

export const DEPRECATION_NOTICE = {
  message: 'This module contains deprecated functions that redirect to officialCalculations.ts',
  action: 'Update your imports to use officialCalculations.ts directly',
  timeline: 'These functions will be removed in the next major version',
  guide: 'See MIGRATION_NOTES.md for detailed migration instructions'
};