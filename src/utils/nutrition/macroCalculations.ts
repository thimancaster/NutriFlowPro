
/**
 * Macro Calculations
 * Calcula distribuição de macronutrientes baseada no perfil e objetivos
 */

import { ActivityLevel, Objective } from '@/types/consultation';

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
 * Distribuição de macronutrientes por perfil e objetivo
 */
const MACRO_DISTRIBUTIONS = {
  magro: {
    emagrecimento: { protein: 25, carbs: 45, fat: 30 },
    manutenção: { protein: 20, carbs: 50, fat: 30 },
    hipertrofia: { protein: 25, carbs: 50, fat: 25 }
  },
  obeso: {
    emagrecimento: { protein: 30, carbs: 35, fat: 35 },
    manutenção: { protein: 25, carbs: 45, fat: 30 },
    hipertrofia: { protein: 25, carbs: 45, fat: 30 }
  },
  atleta: {
    emagrecimento: { protein: 30, carbs: 40, fat: 30 },
    manutenção: { protein: 25, carbs: 50, fat: 25 },
    hipertrofia: { protein: 25, carbs: 55, fat: 20 }
  }
} as const;

/**
 * Proteína por peso corporal (g/kg) baseada no perfil e objetivo
 */
const PROTEIN_PER_KG = {
  magro: {
    emagrecimento: 1.6,
    manutenção: 1.2,
    hipertrofia: 1.8
  },
  obeso: {
    emagrecimento: 1.8,
    manutenção: 1.4,
    hipertrofia: 1.6
  },
  atleta: {
    emagrecimento: 2.2,
    manutenção: 1.8,
    hipertrofia: 2.0
  }
} as const;

/**
 * Calcula macronutrientes baseado no VET, peso e perfil
 */
export function calculateMacros(
  vet: number,
  weight: number,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta',
  customPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  }
): MacroResult {
  // Usar percentuais customizados se fornecidos
  const percentages = customPercentages || MACRO_DISTRIBUTIONS[profile][objective];
  
  // Calcular calorias por macronutriente
  const proteinKcal = (vet * percentages.protein) / 100;
  const carbsKcal = (vet * percentages.carbs) / 100;
  const fatKcal = (vet * percentages.fat) / 100;
  
  // Converter para gramas (4 kcal/g para proteína e carbs, 9 kcal/g para gordura)
  const proteinGrams = proteinKcal / 4;
  const carbsGrams = carbsKcal / 4;
  const fatGrams = fatKcal / 9;
  
  // Calcular proteína por kg
  const proteinPerKg = PROTEIN_PER_KG[profile][objective];
  
  // Verificar se a proteína calculada atende a recomendação por peso
  const recommendedProteinGrams = weight * proteinPerKg;
  const finalProteinGrams = Math.max(proteinGrams, recommendedProteinGrams);
  const finalProteinKcal = finalProteinGrams * 4;
  
  // Ajustar carboidratos se a proteína foi aumentada
  const remainingKcal = vet - finalProteinKcal - fatKcal;
  const finalCarbsKcal = Math.max(0, remainingKcal);
  const finalCarbsGrams = finalCarbsKcal / 4;
  
  return {
    protein: {
      grams: Math.round(finalProteinGrams),
      kcal: Math.round(finalProteinKcal),
      percentage: Math.round((finalProteinKcal / vet) * 100)
    },
    carbs: {
      grams: Math.round(finalCarbsGrams),
      kcal: Math.round(finalCarbsKcal),
      percentage: Math.round((finalCarbsKcal / vet) * 100)
    },
    fat: {
      grams: Math.round(fatGrams),
      kcal: Math.round(fatKcal),
      percentage: Math.round((fatKcal / vet) * 100)
    },
    proteinPerKg: proteinPerKg
  };
}

/**
 * Mapeia perfil do frontend para perfil dos cálculos
 */
export function mapProfileToCalculation(profile: string): 'magro' | 'obeso' | 'atleta' {
  switch (profile) {
    case 'eutrofico':
      return 'magro';
    case 'sobrepeso_obesidade':
      return 'obeso';
    case 'atleta':
      return 'atleta';
    default:
      return 'magro';
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
