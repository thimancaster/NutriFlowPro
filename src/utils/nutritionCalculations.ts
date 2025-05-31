
// Main export file for nutrition calculations - maintains backward compatibility
export * from './nutrition/tmbCalculations';
export * from './nutrition/getCalculations';
export * from './nutrition/vetCalculations';
export * from './nutrition/anthropometryCalculations';
export * from './nutrition/macroCalculations';
export * from './nutrition/validationUtils';
export * from './nutrition/completeCalculation';

// Legacy compatibility exports - redirect to new modular functions
export { calculateTMB as calculateBMR } from './nutrition/tmbCalculations';
export { calculateCompleteNutrition as calculateNutrition } from './nutrition/completeCalculation';
export { calculateMacros as calculateMacrosByProfile } from './nutrition/macroCalculations';

// Unified calculation function that works with existing code
export function calculateCompleteNutrition(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string
) {
  // Import the async function and run it
  import('./nutrition/completeCalculation').then(module => {
    const { calculateCompleteNutrition: asyncCalc } = module;
    const mappedProfile = mapProfileToCalculation(profile);
    return asyncCalc(weight, height, age, sex, activityLevel as any, objective as any, mappedProfile);
  });
  
  // Return a simplified sync version for backward compatibility
  const { calculateTMB } = require('./nutrition/tmbCalculations');
  const { calculateMacros } = require('./nutrition/macroCalculations');
  
  const mappedProfile = mapProfileToCalculation(profile);
  const tmbResult = calculateTMB(weight, height, age, sex, mappedProfile === 'magro' ? 'eutrofico' : mappedProfile === 'obeso' ? 'sobrepeso_obesidade' : 'atleta');
  
  // Simple activity factors for backward compatibility
  const activityFactors: Record<string, number> = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9
  };
  
  const get = tmbResult.tmb * (activityFactors[activityLevel] || 1.55);
  
  // Simple objective adjustments - usar ajustes ENP
  const objectiveAdjustments: Record<string, number> = {
    emagrecimento: -500,  // ENP: déficit de 500 kcal
    manutenção: 0,
    hipertrofia: 400      // ENP: superávit de 400 kcal
  };
  
  const adjustment = objectiveAdjustments[objective] || 0;
  const vet = get + adjustment;
  
  const macros = calculateMacros(vet, weight, objective as any, mappedProfile === 'magro' ? 'eutrofico' : mappedProfile === 'obeso' ? 'sobrepeso_obesidade' : 'atleta');
  
  return {
    tmb: tmbResult.tmb,
    get,
    vet,
    macros,
    formulaUsed: tmbResult.formula
  };
}

// Helper function to map profile types
function mapProfileToCalculation(profile: string): 'magro' | 'obeso' | 'atleta' {
  switch (profile) {
    case 'eutrofico':
      return 'magro';
    case 'sobrepeso_obesidade':
      return 'obeso';
    case 'atleta':
      return 'atleta';
    case 'magro':
      return 'magro';
    case 'obeso':
      return 'obeso';
    default:
      return 'magro';
  }
}
