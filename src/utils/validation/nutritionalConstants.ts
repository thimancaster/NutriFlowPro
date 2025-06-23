
/**
 * Validação de constantes nutricionais conforme padrões científicos
 */

import { PROTEIN_RATIOS, LIPID_RATIOS, CALORIE_VALUES, ACTIVITY_FACTORS, OBJECTIVE_FACTORS } from '@/types/consultation';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida se as constantes nutricionais estão dentro dos padrões científicos aceitos
 */
export const validateNutritionalConstants = (): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar valores calóricos por grama
  if (CALORIE_VALUES.protein !== 4) {
    errors.push('Valor calórico da proteína deve ser 4 kcal/g');
  }
  if (CALORIE_VALUES.carbs !== 4) {
    errors.push('Valor calórico dos carboidratos deve ser 4 kcal/g');
  }
  if (CALORIE_VALUES.fat !== 9) {
    errors.push('Valor calórico da gordura deve ser 9 kcal/g');
  }

  // Validar ratios de proteína (g/kg)
  if (PROTEIN_RATIOS.eutrofico < 0.8 || PROTEIN_RATIOS.eutrofico > 2.0) {
    warnings.push('Ratio de proteína para eutrófico fora da faixa recomendada (0.8-2.0 g/kg)');
  }
  if (PROTEIN_RATIOS.sobrepeso_obesidade < 1.0 || PROTEIN_RATIOS.sobrepeso_obesidade > 2.5) {
    warnings.push('Ratio de proteína para sobrepeso/obesidade fora da faixa recomendada (1.0-2.5 g/kg)');
  }
  if (PROTEIN_RATIOS.atleta < 1.2 || PROTEIN_RATIOS.atleta > 2.2) {
    warnings.push('Ratio de proteína para atleta fora da faixa recomendada (1.2-2.2 g/kg)');
  }

  // Validar ratios de lipídios (g/kg)
  if (LIPID_RATIOS.eutrofico < 0.5 || LIPID_RATIOS.eutrofico > 1.5) {
    warnings.push('Ratio de lipídios para eutrófico fora da faixa recomendada (0.5-1.5 g/kg)');
  }
  if (LIPID_RATIOS.sobrepeso_obesidade < 0.3 || LIPID_RATIOS.sobrepeso_obesidade > 1.0) {
    warnings.push('Ratio de lipídios para sobrepeso/obesidade fora da faixa recomendada (0.3-1.0 g/kg)');
  }
  if (LIPID_RATIOS.atleta < 0.8 || LIPID_RATIOS.atleta > 1.5) {
    warnings.push('Ratio de lipídios para atleta fora da faixa recomendada (0.8-1.5 g/kg)');
  }

  // Validar fatores de atividade
  const activityFactorValues = Object.values(ACTIVITY_FACTORS);
  if (Math.min(...activityFactorValues) < 1.2 || Math.max(...activityFactorValues) > 2.0) {
    warnings.push('Fatores de atividade fora da faixa esperada (1.2-2.0)');
  }

  // Validar fatores de objetivo
  if (OBJECTIVE_FACTORS.emagrecimento > 0.9) {
    warnings.push('Fator para emagrecimento pode ser muito alto (recomendado < 0.9)');
  }
  if (OBJECTIVE_FACTORS.hipertrofia < 1.1) {
    warnings.push('Fator para hipertrofia pode ser muito baixo (recomendado > 1.1)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida distribuição de macronutrientes
 */
export const validateMacroDistribution = (
  proteinPercent: number,
  carbsPercent: number,
  fatPercent: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const total = proteinPercent + carbsPercent + fatPercent;

  if (Math.abs(total - 100) > 0.1) {
    errors.push(`Distribuição de macros deve somar 100% (atual: ${total.toFixed(1)}%)`);
  }

  // Faixas aceitáveis segundo diretrizes nutricionais
  if (proteinPercent < 10 || proteinPercent > 35) {
    warnings.push(`Proteína fora da faixa recomendada: ${proteinPercent.toFixed(1)}% (10-35%)`);
  }
  if (carbsPercent < 45 || carbsPercent > 65) {
    warnings.push(`Carboidratos fora da faixa recomendada: ${carbsPercent.toFixed(1)}% (45-65%)`);
  }
  if (fatPercent < 20 || fatPercent > 35) {
    warnings.push(`Gorduras fora da faixa recomendada: ${fatPercent.toFixed(1)}% (20-35%)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
