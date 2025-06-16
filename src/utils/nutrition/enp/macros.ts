
/**
 * ENP Macronutrient calculations
 */

import { 
  PROTEIN_RATIOS, 
  LIPID_RATIOS, 
  CALORIE_VALUES,
  Objective,
  Profile
} from '@/types/consultation';

export interface ENPMacroResult {
  protein: { grams: number; kcal: number };
  carbs: { grams: number; kcal: number };
  fat: { grams: number; kcal: number };
}

/**
 * Calcula macronutrientes seguindo padrões ENP
 * Proteína e lipídios por g/kg, carboidratos por diferença
 */
export function calculateMacros_ENP(
  get: number,
  weight: number,
  objective: Objective,
  profile: Profile
): ENPMacroResult {
  // 1. Calcular proteína (g/kg conforme perfil)
  const proteinGramsPerKg = PROTEIN_RATIOS[profile];
  const proteinGrams = Math.round(weight * proteinGramsPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // 2. Calcular lipídios (g/kg conforme perfil)  
  const fatGramsPerKg = LIPID_RATIOS[profile];
  const fatGrams = Math.round(weight * fatGramsPerKg);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;

  // 3. Calcular carboidratos por diferença
  const carbsKcal = get - proteinKcal - fatKcal;
  const carbsGrams = Math.round(Math.max(0, carbsKcal) / CALORIE_VALUES.carbs);

  // Ajustar se carboidratos ficaram negativos
  let finalCarbsGrams = carbsGrams;
  let finalCarbsKcal = carbsKcal;
  
  if (carbsKcal < 0) {
    finalCarbsGrams = Math.round(Math.max(get * 0.1, 50) / CALORIE_VALUES.carbs);
    finalCarbsKcal = finalCarbsGrams * CALORIE_VALUES.carbs;
    console.warn('GET muito baixo, ajustando distribuição de macronutrientes');
  }

  return {
    protein: {
      grams: proteinGrams,
      kcal: proteinKcal
    },
    carbs: {
      grams: finalCarbsGrams,
      kcal: finalCarbsKcal
    },
    fat: {
      grams: fatGrams,
      kcal: fatKcal
    }
  };
}
