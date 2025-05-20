
import { Profile, PROTEIN_RATIOS, LIPID_RATIOS, CALORIE_VALUES } from '@/types/consultation';

interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

interface CalculatedMacros {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

// Calculate macronutrients based on profile and weight
export const calculateMacrosByProfile = (
  profile: Profile,
  weight: number,
  vet: number
): CalculatedMacros => {
  if (!weight || weight <= 0 || !vet || vet <= 0) {
    throw new Error('Invalid input for macronutrient calculation');
  }

  // Get appropriate protein ratio based on profile
  const proteinPerKg = PROTEIN_RATIOS[profile] || PROTEIN_RATIOS.normal;

  // Calculate protein grams
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // Get appropriate lipid ratio based on profile
  const fatPerKg = LIPID_RATIOS[profile] || LIPID_RATIOS.normal;

  // Calculate fat grams
  const fatGrams = Math.round(weight * fatPerKg);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;

  // Calculate remaining calories for carbs
  const remainingKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, Math.round(remainingKcal / CALORIE_VALUES.carbs));
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;

  // Calculate percentages
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
    proteinPerKg: proteinPerKg
  };
};

// Map old profile values to new ones for backward compatibility
export const mapLegacyProfile = (profile: string): Profile => {
  switch (profile.toLowerCase()) {
    case 'magro':
      return 'magro';
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    case 'atleta':
      return 'atleta';
    case 'obeso':
      return 'obeso';
    case 'sobrepeso':
      return 'sobrepeso';
    case 'normal':
      return 'normal';
    default:
      return 'normal';
  }
};
