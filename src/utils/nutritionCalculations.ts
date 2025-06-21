
/**
 * Sistema de Cálculos Nutricionais - ENP Unificado
 * Engenharia Nutricional Padrão - Versão Final
 */

// Exports principais ENP
export * from './nutrition/enpCalculations';
export * from './nutrition/cleanCalculations';

// Exportar funções de antropometria
export * from './nutrition/anthropometryCalculations';

// Legacy compatibility exports
export { 
  calculateCompleteNutritionLegacy as calculateCompleteNutrition,
  validateLegacyParameters as validateAllParameters,
  type LegacyCalculationResult as CompleteNutritionResult
} from './nutrition/legacyCalculations';

// Modern calculation exports (recommended)
export { calculateComplete, validateCompleteInputs } from './nutrition/completeCalculation';

// Re-exports organizados para compatibilidade
export { calculateTMB } from './nutrition/tmbCalculations';
export { calculateGET } from './nutrition/getCalculations';
export { calculateVET } from './nutrition/vetCalculations';
export { calculateMacros, mapProfileToCalculation } from './nutrition/macroCalculations';

// Função principal recomendada (ENP)
export { 
  calculateNutritionClean as calculateENPNutrition, 
  validateCalculationInputs as validateENPData 
} from './nutrition/cleanCalculations';
