
/**
 * GUIA DE MIGRAÇÃO DO SISTEMA NUTRICIONAL
 * 
 * Este arquivo documenta como migrar do sistema antigo para o novo motor
 * centralizado que está 100% fiel à planilha.
 */

/**
 * ANTES (Sistema Antigo):
 * 
 * import { calculateCompleteNutrition } from '@/utils/nutritionCalculations';
 * 
 * const result = calculateCompleteNutrition({
 *   weight: 70,
 *   height: 175, 
 *   age: 30,
 *   gender: 'M',
 *   activityFactor: 1.55,
 *   objective: 'hipertrofia',
 *   calorieAdjustment: 400,
 *   proteinPerKg: 2.0,
 *   lipidPerKg: 1.0
 * });
 */

/**
 * DEPOIS (Motor Centralizado - RECOMENDADO):
 * 
 * import { calculateCompleteNutrition } from '@/utils/nutrition/centralMotor';
 * 
 * const result = calculateCompleteNutrition({
 *   weight: 70,
 *   height: 175,
 *   age: 30, 
 *   gender: 'M',
 *   profile: 'eutrofico', // AUTOMÁTICO: seleciona fórmula e parâmetros
 *   activityLevel: 'moderado', // PADRONIZADO: usa fatores exatos da planilha  
 *   objective: 'hipertrofia' // AUTOMÁTICO: aplica +400 kcal conforme planilha
 * });
 */

/**
 * MIGRAÇÃO GRADUAL (Usando Wrapper de Compatibilidade):
 * 
 * import { calculateCompleteNutritionLegacy } from '@/utils/nutrition/centralMotor';
 * 
 * // Mantém assinatura antiga mas usa motor novo internamente
 * const result = calculateCompleteNutritionLegacy(
 *   70, 175, 30, 'M', 'moderado', 'hipertrofia', 'eutrofico'
 * );
 */

export const MIGRATION_STATUS = {
  // Arquivos que DEVEM ser migrados
  TO_MIGRATE: [
    'src/utils/nutritionCalculations.ts',
    'src/utils/calculations/core.ts',
    'src/utils/nutrition/tmbCalculations.ts',
    'src/utils/nutrition/macroCalculations.ts'
  ],
  
  // Arquivos que PODEM usar wrappers temporariamente
  CAN_USE_WRAPPERS: [
    'src/hooks/useNutritionCalculator.ts',
    'src/contexts/calculator/useCalculatorState.ts',
    'src/components/calculator/**/*.tsx'
  ],
  
  // Constantes que DEVEM ser atualizadas
  CONSTANTS_TO_UPDATE: [
    'src/types/consultation.ts - PROTEIN_RATIOS',
    'src/types/consultation.ts - ACTIVITY_FACTORS', 
    'src/types/consultation.ts - OBJECTIVE_FACTORS'
  ]
};

/**
 * CHECKLIST DE MIGRAÇÃO:
 * 
 * □ 1. Testar motor centralizado com casos da planilha
 * □ 2. Atualizar constantes em types/consultation.ts
 * □ 3. Migrar hooks principais para usar motor centralizado  
 * □ 4. Atualizar componentes de UI para novos tipos
 * □ 5. Implementar testes de regressão
 * □ 6. Marcar funções antigas como [DEPRECATED]
 * □ 7. Documentar todas as mudanças
 */

export const VALIDATION_EXAMPLES = [
  {
    name: 'Homem Eutrófico - Hipertrofia',
    inputs: {
      weight: 70,
      height: 175,
      age: 30,
      gender: 'M' as const,
      profile: 'eutrofico' as const,
      activityLevel: 'moderado' as const, 
      objective: 'hipertrofia' as const
    },
    expected: {
      tmb_formula: 'harris_benedict',
      tmb_value: 1697, // 66.5 + (13.75 * 70) + (5.003 * 175) - (6.75 * 30)
      gea: 2630, // 1697 * 1.55
      get: 3030, // 2630 + 400
      protein_grams: 126, // 1.8 * 70
      fat_percentage: 25 // 25% do GET
    }
  },
  {
    name: 'Mulher Obesa - Emagrecimento', 
    inputs: {
      weight: 80,
      height: 160,
      age: 35,
      gender: 'F' as const,
      profile: 'obeso_sobrepeso' as const,
      activityLevel: 'leve' as const,
      objective: 'emagrecimento' as const
    },
    expected: {
      tmb_formula: 'mifflin_st_jeor',
      tmb_value: 1464, // (10 * 80) + (6.25 * 160) - (5 * 35) - 161
      gea: 2013, // 1464 * 1.375
      get: 1513, // 2013 - 500
      protein_grams: 160, // 2.0 * 80
      min_calories_applied: false // GET > 1200
    }
  }
];
