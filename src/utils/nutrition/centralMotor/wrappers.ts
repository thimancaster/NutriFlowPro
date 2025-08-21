
/**
 * WRAPPERS DE COMPATIBILIDADE
 * 
 * Funções wrapper que mantêm a compatibilidade com o código existente
 * enquanto direcionam para o novo motor nutricional centralizado.
 * 
 * [DEPRECATED] - Use diretamente o enpCore para novos desenvolvimentos
 */

import { 
  calculateCompleteNutrition as coreCalculation,
  CalculationInputs,
  ProfileType,
  Gender,
  ActivityLevel,
  ObjectiveType,
  PLANILHA_CONSTANTS
} from './enpCore';

// Mapeamentos para compatibilidade com código legado
const PROFILE_MAPPING: Record<string, ProfileType> = {
  'eutrofico': 'eutrofico',
  'magro': 'eutrofico',
  'normal': 'eutrofico',
  'sobrepeso_obesidade': 'obeso_sobrepeso',
  'obeso': 'obeso_sobrepeso',
  'sobrepeso': 'obeso_sobrepeso',
  'atleta': 'atleta'
};

const ACTIVITY_MAPPING: Record<string, ActivityLevel> = {
  'sedentario': 'sedentario',
  'leve': 'leve', 
  'moderado': 'moderado',
  'intenso': 'muito_ativo',
  'muito_intenso': 'extremamente_ativo'
};

const OBJECTIVE_MAPPING: Record<string, ObjectiveType> = {
  'manutenção': 'manutencao',
  'manutencao': 'manutencao',
  'emagrecimento': 'emagrecimento',
  'hipertrofia': 'hipertrofia',
  'ganho_massa': 'hipertrofia'
};

/**
 * [DEPRECATED] Wrapper para compatibilidade com sistema legado
 * Use calculateCompleteNutrition do enpCore diretamente
 */
export function calculateCompleteNutritionLegacy(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string
) {
  console.warn('[DEPRECATED] Use calculateCompleteNutrition do enpCore diretamente');
  
  // Mapear parâmetros legados para novos
  const mappedProfile = PROFILE_MAPPING[profile.toLowerCase()] || 'eutrofico';
  const mappedActivity = ACTIVITY_MAPPING[activityLevel.toLowerCase()] || 'moderado';
  const mappedObjective = OBJECTIVE_MAPPING[objective.toLowerCase()] || 'manutencao';

  const inputs: CalculationInputs = {
    weight,
    height,
    age,
    gender: sex,
    profile: mappedProfile,
    activityLevel: mappedActivity,
    objective: mappedObjective
  };

  const result = coreCalculation(inputs);

  // Converter resultado para formato legado
  return {
    tmb: result.tmb.value,
    get: result.get,
    vet: result.get, // VET = GET no novo sistema
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
    formulaUsed: result.formulaUsed,
    recommendations: `Fórmula ${result.tmb.formula} aplicada para perfil ${result.profileUsed}`,
    mealDistribution: result.mealDistribution
  };
}

/**
 * [DEPRECATED] Wrapper para cálculo de TMB legado
 */
export function calculateTMBLegacy(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  profile: string
) {
  console.warn('[DEPRECATED] Use calculateTMB do enpCore diretamente');
  
  const mappedProfile = PROFILE_MAPPING[profile.toLowerCase()] || 'eutrofico';
  
  const inputs: CalculationInputs = {
    weight,
    height,
    age,
    gender: sex,
    profile: mappedProfile,
    activityLevel: 'moderado', // Valor padrão para cálculo isolado
    objective: 'manutencao'    // Valor padrão para cálculo isolado
  };

  const result = coreCalculation(inputs);
  
  return {
    tmb: result.tmb.value,
    formula: result.tmb.formula,
    details: result.tmb.details
  };
}

/**
 * [DEPRECATED] Wrapper para fatores de atividade legados
 */
export const ACTIVITY_FACTORS_LEGACY = PLANILHA_CONSTANTS.ACTIVITY_FACTORS;

/**
 * [DEPRECATED] Wrapper para ratios de proteína legados  
 */
export const PROTEIN_RATIOS_LEGACY = PLANILHA_CONSTANTS.PROTEIN_RATIOS;

/**
 * [DEPRECATED] Wrapper para ajustes de objetivo legados
 */
export const OBJECTIVE_FACTORS_LEGACY = PLANILHA_CONSTANTS.OBJECTIVE_ADJUSTMENTS;
