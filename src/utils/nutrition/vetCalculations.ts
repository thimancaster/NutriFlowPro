
/**
 * VET (Valor Energético Total) Calculations - Implementação ENP
 * Implementa ajustes calóricos conforme Engenharia Nutricional Padrão
 */

import { ActivityLevel, Objective } from '@/types/consultation';

export interface VETResult {
  vet: number;
  adjustment: number;
  formula: string;
  details: {
    get: number;
    objective: Objective;
    activityLevel: ActivityLevel;
  };
}

/**
 * Calcula VET aplicando Fator Objetivo conforme ENP Seção 3.3
 * Implementa ajustes calóricos fixos conforme especificação ENP
 */
export function calculateVET(
  get: number,
  activityLevel: ActivityLevel,
  objective: Objective,
  profile?: string // Mantido para compatibilidade, mas não usado conforme ENP
): VETResult {
  let vet: number;
  let adjustment: number;
  
  // Aplicar Fator Objetivo conforme ENP Seção 3.3
  switch (objective) {
    case 'manutenção':
      // Manter Peso: GET = GEA (sem ajuste)
      vet = get;
      adjustment = 0;
      break;
      
    case 'emagrecimento':
      // Perder Peso: GET = GEA - 500 kcal
      adjustment = -500;
      vet = get + adjustment;
      
      // Verificação ENP: garantir que não seja inferior à TMB ou 1200 kcal
      const minimumSafe = 1200; // Valor mínimo seguro conforme ENP
      if (vet < minimumSafe) {
        vet = minimumSafe;
        adjustment = minimumSafe - get;
      }
      break;
      
    case 'hipertrofia':
      // Ganhar Peso/Massa Muscular: GET = GEA + 400 kcal
      adjustment = 400;
      vet = get + adjustment;
      break;
      
    case 'personalizado':
      // Personalizado mantém o GET sem ajuste (nutricionista pode ajustar manualmente)
      vet = get;
      adjustment = 0;
      break;
      
    default:
      vet = get;
      adjustment = 0;
  }
  
  return {
    vet: Math.round(vet),
    adjustment,
    formula: 'ENP - Fator Objetivo Padrão',
    details: {
      get,
      objective,
      activityLevel
    }
  };
}

/**
 * Validação dos parâmetros de VET
 */
export function validateVETParameters(
  get: number,
  objective: Objective,
  activityLevel: ActivityLevel
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (get <= 0 || get > 10000) {
    errors.push('GET deve estar entre 1 e 10000 kcal');
  }
  
  const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'personalizado'];
  if (!validObjectives.includes(objective)) {
    errors.push('Objetivo deve ser: emagrecimento, manutenção, hipertrofia ou personalizado');
  }
  
  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  if (!validActivityLevels.includes(activityLevel)) {
    errors.push('Nível de atividade inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
