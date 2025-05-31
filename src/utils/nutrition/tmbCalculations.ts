
/**
 * TMB (Taxa Metabólica Basal) Calculations - Atualizado para ENP
 * Usa exclusivamente Harris-Benedict Revisada conforme ENP
 */

import { calculateTMB_ENP } from './enpCalculations';

export interface TMBResult {
  tmb: number;
  formula: string;
  details: {
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    profile: string;
  };
}

/**
 * Calcula TMB usando Harris-Benedict Revisada (ÚNICA FÓRMULA ENP)
 * Mantém compatibilidade com assinatura existente mas usa sempre a mesma fórmula
 */
export function calculateTMB(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' | 'magro' | 'obeso'
): TMBResult {
  // Usar sempre Harris-Benedict Revisada independente do perfil (conforme ENP)
  const tmb = calculateTMB_ENP(weight, height, age, sex);
  
  return {
    tmb: Math.round(tmb),
    formula: 'Harris-Benedict Revisada (ENP)',
    details: {
      weight,
      height,
      age,
      sex,
      profile: typeof profile === 'string' ? profile : 'eutrofico'
    }
  };
}

/**
 * Validação dos parâmetros de entrada
 */
export function validateTMBParameters(
  weight: number,
  height: number,
  age: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula múltiplas fórmulas para comparação (mantido para compatibilidade)
 * Mas agora todas retornam Harris-Benedict Revisada
 */
export function calculateMultipleTMBFormulas(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): Record<string, number> {
  const harrisBenedict = calculateTMB_ENP(weight, height, age, sex);
  
  return {
    'Harris-Benedict Revisada (ENP)': Math.round(harrisBenedict),
    'Fórmula Padrão': Math.round(harrisBenedict),
    'Fórmula Única': Math.round(harrisBenedict)
  };
}
