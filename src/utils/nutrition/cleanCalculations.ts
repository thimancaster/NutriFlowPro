
/**
 * ENP Clean Calculations - Sistema Limpo e Padronizado
 * Mantém apenas as funções essenciais para ENP
 */

import { calculateCompleteENP, ENPInputs, ENPResults } from './enpCalculations';
import { ActivityLevel, Objective } from '@/types/consultation';

// Mapeamento simples para compatibilidade com tipos existentes
export function mapToENPActivityLevel(level: ActivityLevel): 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo' {
  const mapping: Record<ActivityLevel, 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo'> = {
    sedentario: 'sedentario',
    leve: 'leve',
    moderado: 'moderado',
    intenso: 'muito_ativo',
    muito_intenso: 'extremamente_ativo'
  };
  return mapping[level];
}

export function mapToENPObjective(objective: Objective): 'manter_peso' | 'perder_peso' | 'ganhar_peso' {
  const mapping: Record<Objective, 'manter_peso' | 'perder_peso' | 'ganhar_peso'> = {
    manutenção: 'manter_peso',
    emagrecimento: 'perder_peso',
    hipertrofia: 'ganhar_peso',
    personalizado: 'manter_peso'
  };
  return mapping[objective];
}

/**
 * Função principal unificada para cálculos ENP
 */
export function calculateENPNutrition(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective
): ENPResults {
  const enpInputs: ENPInputs = {
    weight,
    height,
    age,
    sex,
    activityLevel: mapToENPActivityLevel(activityLevel),
    objective: mapToENPObjective(objective)
  };

  return calculateCompleteENP(enpInputs);
}

/**
 * Validação de entrada padronizada ENP
 */
export function validateENPData(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!weight || weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!height || height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!age || age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  if (!['M', 'F'].includes(sex)) {
    errors.push('Sexo deve ser M ou F');
  }

  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  if (!validActivityLevels.includes(activityLevel)) {
    errors.push('Nível de atividade inválido');
  }

  const validObjectives = ['manutenção', 'emagrecimento', 'hipertrofia', 'personalizado'];
  if (!validObjectives.includes(objective)) {
    errors.push('Objetivo inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
