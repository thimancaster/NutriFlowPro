
/**
 * Core ENP calculation functions
 */

import { ActivityLevel, Objective } from '@/types/consultation';

/**
 * Calcula TMB usando Harris-Benedict Revisada (padrão ENP)
 */
export function calculateTMB_ENP(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): number {
  if (sex === 'M') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Calcula GEA (Gasto Energético de Atividade)
 */
export function calculateGEA_ENP(
  tmb: number,
  activityLevel: ActivityLevel
): number {
  const factors = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9
  };
  
  const factor = factors[activityLevel] || 1.55;
  return Math.round(tmb * factor);
}

/**
 * Calcula GET (Gasto Energético Total) com ajuste por objetivo
 */
export function calculateGET_ENP(
  gea: number,
  objective: Objective
): number {
  switch (objective) {
    case 'emagrecimento':
      return gea - 500; // Déficit de 500 kcal conforme ENP
    case 'hipertrofia':
      return gea + 400; // Superávit de 400 kcal conforme ENP
    case 'manutenção':
    default:
      return gea; // Sem ajuste
  }
}
