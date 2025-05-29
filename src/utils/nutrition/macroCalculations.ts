
import { 
  Profile, 
  Objective, 
  PROTEIN_RATIOS, 
  LIPID_RATIOS,
  CALORIE_VALUES 
} from '@/types/consultation';

/**
 * Calcula macronutrientes seguindo a lógica sequencial da planilha
 */
export const calculateMacrosByProfile = (
  profile: Profile,
  weight: number,
  vet: number,
  objective: Objective
): {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
  proteinPerKg: number;
} => {
  // 1. Calcular proteínas baseado no perfil e peso
  const proteinRatio = PROTEIN_RATIOS[profile];
  const proteinGrams = weight * proteinRatio;
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;
  
  // 2. Calcular gorduras baseado no perfil e peso
  const fatRatio = LIPID_RATIOS[profile];
  const fatGrams = weight * fatRatio;
  const fatKcal = fatGrams * CALORIE_VALUES.fat;
  
  // 3. Calcular carboidratos com as calorias restantes
  const remainingKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, remainingKcal / CALORIE_VALUES.carbs);
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;
  
  // 4. Calcular percentuais
  const proteinPercentage = (proteinKcal / vet) * 100;
  const carbsPercentage = (carbsKcal / vet) * 100;
  const fatPercentage = (fatKcal / vet) * 100;
  
  return {
    protein: {
      grams: Math.round(proteinGrams),
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercentage)
    },
    carbs: {
      grams: Math.round(carbsGrams),
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercentage)
    },
    fat: {
      grams: Math.round(fatGrams),
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercentage)
    },
    proteinPerKg: proteinRatio
  };
};
