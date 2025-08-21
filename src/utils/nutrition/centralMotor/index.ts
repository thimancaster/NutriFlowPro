
/**
 * MOTOR NUTRICIONAL CENTRAL - PONTO DE ENTRADA PRINCIPAL
 * 
 * Este módulo exporta todas as funcionalidades do motor nutricional
 * que está 100% fiel à planilha central.
 * 
 * PARA NOVOS DESENVOLVIMENTOS: Use as funções do enpCore
 * PARA CÓDIGO LEGADO: Use os wrappers de compatibilidade
 */

// Exportações principais (RECOMENDADO para novos desenvolvimentos)
export {
  calculateCompleteNutrition,
  calculateTMB,
  calculateGEA, 
  calculateGET,
  calculateMacronutrients,
  calculateMealDistribution,
  validateInputs,
  PLANILHA_CONSTANTS,
  
  // Types
  type CalculationInputs,
  type TMBResult,
  type MacroResult, 
  type CompleteNutritionalResult,
  type ProfileType,
  type Gender,
  type ActivityLevel,
  type ObjectiveType
} from './enpCore';

// Exportações de compatibilidade (DEPRECATED - manter para não quebrar código existente)
export {
  calculateCompleteNutritionLegacy,
  calculateTMBLegacy,
  ACTIVITY_FACTORS_LEGACY,
  PROTEIN_RATIOS_LEGACY,
  OBJECTIVE_FACTORS_LEGACY
} from './wrappers';

// Re-export das constantes com nomes legados para compatibilidade
export const ACTIVITY_FACTORS = PLANILHA_CONSTANTS.ACTIVITY_FACTORS;
export const PROTEIN_RATIOS = PLANILHA_CONSTANTS.PROTEIN_RATIOS; 
export const OBJECTIVE_FACTORS = PLANILHA_CONSTANTS.OBJECTIVE_ADJUSTMENTS;
export const CALORIE_VALUES = PLANILHA_CONSTANTS.CALORIC_VALUES;

/**
 * FUNÇÃO PRINCIPAL RECOMENDADA
 * 
 * Esta é a função que deve ser usada em todos os novos desenvolvimentos.
 * Ela garante 100% de fidelidade à planilha central.
 */
export { calculateCompleteNutrition as calculateENPNutrition } from './enpCore';

/**
 * VALIDAÇÃO RECOMENDADA
 */
export { validateInputs as validateENPInputs } from './enpCore';
