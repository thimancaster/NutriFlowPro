
/**
 * Sistema limpo e organizado de cálculos nutricionais
 * Substitui funções legadas e garante consistência
 */

import { calculateCompleteENP, ENPInputs, ENPResults } from './enpCalculations';
import { ActivityLevel, Objective, Profile } from '@/types/consultation';

/**
 * Interface padronizada para entrada de dados
 */
export interface CleanCalculationInputs {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
  profile: Profile;
  bodyFatPercentage?: number;
}

/**
 * Interface padronizada para resultados
 */
export interface CleanCalculationResults {
  tmb: number;
  gea: number;
  get: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
  };
  proteinPerKg: number;
}

/**
 * Função principal que substitui todos os cálculos legados
 */
export function calculateNutritionClean(inputs: CleanCalculationInputs): CleanCalculationResults {
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

  const enpResults = calculateCompleteENP(enpInputs);
  
  // Calcular percentuais
  const totalKcal = enpResults.get;
  const proteinPercentage = Math.round((enpResults.macros.protein.kcal / totalKcal) * 100 * 100) / 100;
  const carbsPercentage = Math.round((enpResults.macros.carbs.kcal / totalKcal) * 100 * 100) / 100;
  const fatPercentage = Math.round((enpResults.macros.fat.kcal / totalKcal) * 100 * 100) / 100;
  
  const proteinPerKg = Math.round((enpResults.macros.protein.grams / inputs.weight) * 100) / 100;

  return {
    tmb: enpResults.tmb,
    gea: enpResults.gea,
    get: enpResults.get,
    macros: {
      protein: {
        grams: enpResults.macros.protein.grams,
        kcal: enpResults.macros.protein.kcal,
        percentage: proteinPercentage
      },
      carbs: {
        grams: enpResults.macros.carbs.grams,
        kcal: enpResults.macros.carbs.kcal,
        percentage: carbsPercentage
      },
      fat: {
        grams: enpResults.macros.fat.grams,
        kcal: enpResults.macros.fat.kcal,
        percentage: fatPercentage
      }
    },
    proteinPerKg
  };
}

/**
 * Alias for backward compatibility
 */
export const calculateENPNutrition = calculateNutritionClean;

/**
 * Valida entrada de dados
 */
export function validateCalculationInputs(inputs: CleanCalculationInputs): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  if (!inputs.weight || inputs.weight <= 0 || inputs.weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!inputs.height || inputs.height <= 0 || inputs.height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!inputs.age || inputs.age <= 0 || inputs.age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  if (!['M', 'F'].includes(inputs.sex)) {
    errors.push('Sexo deve ser M ou F');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Alias for backward compatibility
 */
export const validateENPData = validateCalculationInputs;
