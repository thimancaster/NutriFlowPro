
import { Profile, Objective, PROTEIN_RATIOS, LIPID_RATIOS, CALORIE_VALUES } from '@/types/consultation';

// Re-export types for compatibility using proper TypeScript syntax
export type { Profile, Objective } from '@/types/consultation';

interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

export interface CalculatedMacros {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

/**
 * Calcula macronutrientes baseado no perfil do paciente conforme planilha original
 */
export const calculateMacrosByProfile = (
  profile: Profile,
  weight: number,
  vet: number,
  objective: Objective = 'manutenção'
): CalculatedMacros => {
  if (weight <= 0 || vet <= 0) {
    throw new Error('Weight and VET must be positive values');
  }

  // Calcular proteína em g/kg conforme planilha
  const proteinRatio = PROTEIN_RATIOS[profile];
  const proteinGrams = Math.round(weight * proteinRatio);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // Calcular lipídios em g/kg conforme planilha
  const lipidRatio = LIPID_RATIOS[profile];
  const fatGrams = Math.round(weight * lipidRatio);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;

  // Calcular carboidratos como o restante das calorias
  const remainingKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, Math.round(remainingKcal / CALORIE_VALUES.carbs));
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;

  // Calcular percentuais
  const totalKcal = proteinKcal + carbsKcal + fatKcal;
  const proteinPercentage = Math.round((proteinKcal / totalKcal) * 100);
  const carbsPercentage = Math.round((carbsKcal / totalKcal) * 100);
  const fatPercentage = Math.round((fatKcal / totalKcal) * 100);

  return {
    protein: {
      grams: proteinGrams,
      kcal: proteinKcal,
      percentage: proteinPercentage
    },
    carbs: {
      grams: carbsGrams,
      kcal: carbsKcal,
      percentage: carbsPercentage
    },
    fat: {
      grams: fatGrams,
      kcal: fatKcal,
      percentage: fatPercentage
    },
    proteinPerKg: proteinRatio
  };
};
