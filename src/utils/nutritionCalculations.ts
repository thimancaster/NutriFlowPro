/**
 * [DEPRECATED] Sistema de Cálculos Nutricionais - LEGACY
 * 
 * ⚠️  AVISO: Este sistema está sendo descontinuado.
 * 
 * Para novos desenvolvimentos, use:
 * import { calculateCompleteNutrition } from '@/utils/nutrition/centralMotor';
 * 
 * Este arquivo mantém compatibilidade com código existente mas redireciona
 * internamente para o novo motor nutricional que é 100% fiel à planilha.
 */

console.warn(`
🔄 SISTEMA NUTRICIONAL EM MIGRAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este arquivo (nutritionCalculations.ts) está DEPRECATED.

✅ PARA NOVOS DESENVOLVIMENTOS:
   import { calculateCompleteNutrition } from '@/utils/nutrition/centralMotor';

⚠️  PARA CÓDIGO LEGADO:
   Este arquivo mantém compatibilidade mas redireciona para o motor atualizado.

📋 MIGRAÇÃO RECOMENDADA:
   Substitua as chamadas antigas pelo novo motor nutricional centralizado.
`);

// Redirecionar para motor nutricional centralizado
export * from './nutrition/centralMotor';

// Manter exports legados com wrappers
export { 
  calculateCompleteNutritionLegacy as calculateCompleteNutrition,
  calculateTMBLegacy as calculateTMB
} from './nutrition/centralMotor/wrappers';

// Exportar funções de antropometria
export * from './nutrition/anthropometryCalculations';

// Legacy compatibility exports
export { 
  validateLegacyParameters as validateAllParameters,
  type LegacyCalculationResult as CompleteNutritionResult
} from './nutrition/legacyCalculations';

// Modern calculation exports (recommended)
export { calculateComplete, validateCompleteInputs } from './nutrition/completeCalculation';

// Re-exports organizados para compatibilidade
export { calculateGET } from './nutrition/getCalculations';
export { calculateVET } from './nutrition/vetCalculations';

// Função principal recomendada (ENP)
export { 
  validateCalculationInputs as validateENPData 
} from './nutrition/cleanCalculations';
