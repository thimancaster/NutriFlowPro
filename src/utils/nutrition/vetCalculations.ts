
import { Objective } from '@/types/consultation';

/**
 * Calcula VET aplicando ajuste baseado no objetivo conforme planilha original
 */
export const calculateVET = (get: number, objective: Objective): number => {
  let adjustmentFactor: number;
  
  switch (objective) {
    case 'emagrecimento':
      adjustmentFactor = 0.8; // Déficit de 20% conforme planilha
      break;
    case 'hipertrofia':
      adjustmentFactor = 1.15; // Superávit de 15% conforme planilha
      break;
    case 'manutenção':
      adjustmentFactor = 1.0; // Sem ajuste conforme planilha
      break;
    case 'personalizado':
    default:
      adjustmentFactor = 1.0; // Sem ajuste padrão
  }
  
  return Math.round(get * adjustmentFactor);
};
