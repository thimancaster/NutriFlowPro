
/**
 * Macro Calculations - Atualizado para ENP
 * Mantém compatibilidade com sistema existente usando padrões ENP
 */

import { ActivityLevel, Objective } from '@/types/consultation';
import { calculateMacrosENPWrapper } from './compatibilityMapping';

export interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

export interface MacroResult {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

/**
 * Calcula macronutrientes usando padrões ENP
 * Mantém assinatura para compatibilidade com código existente
 */
export function calculateMacros(
  vet: number,
  weight: number,
  objective: Objective,
  profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' | 'magro' | 'obeso' | 'atleta',
  customPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  }
): MacroResult {
  // Se percentuais customizados forem fornecidos, usar eles
  if (customPercentages) {
    const proteinKcal = (vet * customPercentages.protein) / 100;
    const carbsKcal = (vet * customPercentages.carbs) / 100;
    const fatKcal = (vet * customPercentages.fat) / 100;
    
    return {
      protein: {
        grams: Math.round(proteinKcal / 4),
        kcal: Math.round(proteinKcal),
        percentage: customPercentages.protein
      },
      carbs: {
        grams: Math.round(carbsKcal / 4),
        kcal: Math.round(carbsKcal),
        percentage: customPercentages.carbs
      },
      fat: {
        grams: Math.round(fatKcal / 9),
        kcal: Math.round(fatKcal),
        percentage: customPercentages.fat
      },
      proteinPerKg: Math.round((proteinKcal / 4) / weight * 100) / 100
    };
  }
  
  // Usar padrões ENP através do wrapper de compatibilidade
  return calculateMacrosENPWrapper(vet, weight, objective, profile);
}

/**
 * Mapeia perfil do frontend para perfil dos cálculos
 * Mantém compatibilidade com sistema existente
 */
export function mapProfileToCalculation(profile: string): 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' {
  switch (profile) {
    case 'magro':
    case 'eutrofico':
      return 'eutrofico';
    case 'obeso':
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    case 'atleta':
      return 'atleta';
    default:
      return 'eutrofico';
  }
}

/**
 * Valida distribuição de macronutrientes
 */
export function validateMacroDistribution(
  protein: number,
  carbs: number,
  fat: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const total = protein + carbs + fat;
  
  if (Math.abs(total - 100) > 1) {
    errors.push('A soma dos macronutrientes deve ser 100%');
  }
  
  if (protein < 10 || protein > 40) {
    errors.push('Proteína deve estar entre 10% e 40%');
  }
  
  if (carbs < 20 || carbs > 70) {
    errors.push('Carboidratos devem estar entre 20% e 70%');
  }
  
  if (fat < 15 || fat > 50) {
    errors.push('Gorduras devem estar entre 15% e 50%');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
