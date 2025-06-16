
/**
 * Cálculos ENP - Sistema principal para todas as fórmulas
 * Garante consistência e precisão em todos os cálculos
 */

import { ActivityLevel, Objective, Profile, PROTEIN_RATIOS } from '@/types/consultation';
import { calculateTMB_ENP, calculateGEA_ENP, calculateGET_ENP } from './enp/core';
import { calculateMacros_ENP } from './enp/macros';
import type { ENPMacroResult } from './enp/macros';

export type { ENPMacroResult };

export interface ENPInputs {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: ActivityLevel;
  objective: Objective;
  profile: Profile;
  bodyFatPercentage?: number;
}

export interface ENPResults {
  tmb: number;
  gea: number;
  get: number;
  macros: ENPMacroResult;
}

/**
 * Cálculo completo ENP com todas as etapas
 */
export function calculateCompleteENP(inputs: ENPInputs): ENPResults {
  const tmb = calculateTMB_ENP(inputs.weight, inputs.height, inputs.age, inputs.sex);
  const gea = calculateGEA_ENP(tmb, inputs.activityLevel);
  const get = calculateGET_ENP(gea, inputs.objective);
  const macros = calculateMacros_ENP(get, inputs.weight, inputs.objective, inputs.profile);

  return {
    tmb,
    gea,
    get,
    macros
  };
}

/**
 * Validação completa dos parâmetros ENP
 */
export function validateENPParameters(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validações antropométricas
  if (!weight || weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!height || height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!age || age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  // Validações de dados categóricos
  if (!['M', 'F'].includes(sex)) {
    errors.push('Sexo deve ser M ou F');
  }

  if (!Object.keys(PROTEIN_RATIOS).includes(profile)) {
    errors.push('Perfil corporal inválido');
  }

  // Validações de consistência
  if (weight && height) {
    const imc = weight / Math.pow(height / 100, 2);
    if (imc < 10 || imc > 60) {
      errors.push(`IMC calculado (${imc.toFixed(1)}) está fora da faixa esperada`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Re-export core functions
export { calculateTMB_ENP, calculateGEA_ENP, calculateGET_ENP } from './enp/core';
export { calculateMacros_ENP } from './enp/macros';
