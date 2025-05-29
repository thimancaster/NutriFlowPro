
import { Objective } from '@/types/consultation';

/**
 * Calcula VET aplicando ajuste baseado no objetivo
 */
export const calculateVET = (get: number, objective: Objective): number => {
  let adjustmentFactor: number;
  
  switch (objective) {
    case 'emagrecimento':
      adjustmentFactor = 0.8; // Déficit de 20%
      break;
    case 'hipertrofia':
      adjustmentFactor = 1.15; // Superávit de 15%
      break;
    case 'manutenção':
    case 'personalizado':
    default:
      adjustmentFactor = 1.0; // Sem ajuste
  }
  
  return Math.round(get * adjustmentFactor);
};
