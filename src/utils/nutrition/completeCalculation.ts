
/**
 * Sistema completo de cálculos nutricionais
 * Integra todas as fórmulas GER com cálculos de macronutrientes
 */

import { GERFormula } from '@/types/gerFormulas';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';
import { calculateGER } from './gerCalculations';
import { calculateCompleteENP, ENPInputs } from './enpCalculations';
import { ACTIVITY_FACTORS } from '@/types/consultation';

export interface CompleteCalculationInputs {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
  profile: Profile;
  gerFormula: GERFormula;
  bodyFatPercentage?: number;
}

export interface CompleteCalculationResults {
  ger: number;
  gea: number;
  get: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
  };
  gerFormulaName: string;
  proteinPerKg: number;
}

// Legacy compatibility types and exports
export interface CompleteNutritionResult {
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
}

/**
 * Cálculo completo usando qualquer fórmula GER
 */
export function calculateComplete(inputs: CompleteCalculationInputs): CompleteCalculationResults {
  // 1. Calcular GER usando a fórmula selecionada
  const gerResult = calculateGER(inputs.gerFormula, {
    weight: inputs.weight,
    height: inputs.height,
    age: inputs.age,
    sex: inputs.sex,
    bodyFatPercentage: inputs.bodyFatPercentage
  });

  // 2. Calcular GEA (aplicar fator de atividade)
  const activityFactor = ACTIVITY_FACTORS[inputs.activityLevel] || 1.2;
  const gea = Math.round(gerResult.ger * activityFactor);

  // 3. Calcular GET (aplicar ajuste por objetivo)
  let get = gea;
  switch (inputs.objective) {
    case 'emagrecimento':
      get = gea - 500;
      break;
    case 'hipertrofia':
      get = gea + 400;
      break;
    case 'manutenção':
    default:
      get = gea;
      break;
  }

  // 4. Calcular macronutrientes usando sistema ENP
  const enpInputs: ENPInputs = {
    weight: inputs.weight,
    height: inputs.height,
    age: inputs.age,
    sex: inputs.sex,
    activityLevel: inputs.activityLevel,
    objective: inputs.objective,
    profile: inputs.profile,
    bodyFatPercentage: inputs.bodyFatPercentage
  };

  const enpResult = calculateCompleteENP(enpInputs);
  
  // Ajustar macros para o GET calculado com a fórmula GER específica
  const macroAdjustmentFactor = get / enpResult.get;
  
  const adjustedMacros = {
    protein: {
      grams: Math.round(enpResult.macros.protein.grams * macroAdjustmentFactor),
      kcal: Math.round(enpResult.macros.protein.kcal * macroAdjustmentFactor),
      percentage: 0
    },
    carbs: {
      grams: Math.round(enpResult.macros.carbs.grams * macroAdjustmentFactor),
      kcal: Math.round(enpResult.macros.carbs.kcal * macroAdjustmentFactor),
      percentage: 0
    },
    fat: {
      grams: Math.round(enpResult.macros.fat.grams * macroAdjustmentFactor),
      kcal: Math.round(enpResult.macros.fat.kcal * macroAdjustmentFactor),
      percentage: 0
    }
  };

  // Calcular percentuais finais
  adjustedMacros.protein.percentage = Math.round((adjustedMacros.protein.kcal / get) * 100 * 100) / 100;
  adjustedMacros.carbs.percentage = Math.round((adjustedMacros.carbs.kcal / get) * 100 * 100) / 100;
  adjustedMacros.fat.percentage = Math.round((adjustedMacros.fat.kcal / get) * 100 * 100) / 100;

  const proteinPerKg = Math.round((adjustedMacros.protein.grams / inputs.weight) * 100) / 100;

  return {
    ger: gerResult.ger,
    gea,
    get,
    macros: adjustedMacros,
    gerFormulaName: gerResult.formulaName,
    proteinPerKg
  };
}

/**
 * Legacy function for backward compatibility
 */
export function calculateCompleteNutrition(inputs: CompleteCalculationInputs): CompleteNutritionResult {
  const result = calculateComplete(inputs);
  
  return {
    tmb: result.ger,
    vet: result.get,
    get: result.get,
    formulaUsed: result.gerFormulaName,
    macros: result.macros,
    proteinPerKg: result.proteinPerKg,
    recommendations: []
  };
}

/**
 * Validação completa incluindo requisitos específicos das fórmulas
 */
export function validateCompleteInputs(inputs: CompleteCalculationInputs): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validações básicas
  if (!inputs.weight || inputs.weight <= 0 || inputs.weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!inputs.height || inputs.height <= 0 || inputs.height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!inputs.age || inputs.age <= 0 || inputs.age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  // Validação específica de % gordura para fórmulas que REQUEREM
  if ((inputs.gerFormula === 'katch_mcardle' || inputs.gerFormula === 'cunningham') && !inputs.bodyFatPercentage) {
    errors.push(`A fórmula ${inputs.gerFormula === 'katch_mcardle' ? 'Katch-McArdle' : 'Cunningham'} requer obrigatoriamente o percentual de gordura corporal`);
  }

  if (inputs.bodyFatPercentage && (inputs.bodyFatPercentage < 3 || inputs.bodyFatPercentage > 50)) {
    errors.push('Percentual de gordura deve estar entre 3% e 50%');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Legacy alias
export const validateAllParameters = validateCompleteInputs;
