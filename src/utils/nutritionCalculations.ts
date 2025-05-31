
/**
 * Sistema de Cálculos Nutricionais - ENP Unificado
 * Engenharia Nutricional Padrão - Versão Final
 */

// Exports principais ENP
export * from './nutrition/enpCalculations';
export * from './nutrition/cleanCalculations';

// Manter compatibilidade com sistema legado
export { calculateCompleteNutrition } from './nutrition/completeCalculation';
export { validateAllParameters } from './nutrition/completeCalculation';

// Re-exports organizados para compatibilidade
export { calculateTMB } from './nutrition/tmbCalculations';
export { calculateGET } from './nutrition/getCalculations';
export { calculateVET } from './nutrition/vetCalculations';
export { calculateMacros } from './nutrition/macroCalculations';

// Função principal recomendada (ENP)
export { calculateENPNutrition, validateENPData } from './nutrition/cleanCalculations';

/**
 * @deprecated Use calculateENPNutrition para novos desenvolvimentos
 * Mantido apenas para compatibilidade com código existente
 */
export function calculateCompleteNutrition_Legacy(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: string,
  objective: string,
  profile: string
) {
  console.warn('Função legada em uso. Recomenda-se migrar para calculateENPNutrition');
  
  // Importação dinâmica para evitar dependências circulares
  const { calculateCompleteNutrition } = require('./nutrition/completeCalculation');
  return calculateCompleteNutrition(weight, height, age, sex, activityLevel as any, objective as any, profile === 'eutrofico' ? 'magro' : profile === 'sobrepeso_obesidade' ? 'obeso' : 'atleta');
}
