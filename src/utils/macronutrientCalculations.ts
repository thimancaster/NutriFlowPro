
import { Profile, PROTEIN_RATIOS, LIPID_RATIOS, CALORIE_VALUES } from '@/types/consultation';

/**
 * Calculates macronutrient distribution based on weight and profile
 * Using the weight-based approach with protein and fat calculated directly
 * and carbs calculated by difference from the VET
 */
export function calculateMacrosByProfile(
  profile: Profile,
  weight: number,
  vet: number
): {
  protein: { grams: number, kcal: number, percentage: number, perKg: number },
  carbs: { grams: number, kcal: number, percentage: number },
  fat: { grams: number, kcal: number, percentage: number, perKg: number }
} {
  // Validate inputs
  if (weight <= 0 || vet <= 0) {
    throw new Error('Weight and VET must be greater than zero');
  }
  
  // 1. Calculate protein based on g/kg for the profile
  const proteinPerKg = PROTEIN_RATIOS[profile] || PROTEIN_RATIOS.eutrofico; // Default to eutrofico if profile not found
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;
  
  // 2. Calculate lipids based on g/kg for the profile
  const fatPerKg = LIPID_RATIOS[profile] || LIPID_RATIOS.eutrofico; // Default to eutrofico if profile not found
  const fatGrams = Math.round(weight * fatPerKg);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;
  
  // 3. Calculate carbs by difference from VET
  const remainingKcal = Math.max(0, vet - (proteinKcal + fatKcal));
  const carbsGrams = Math.round(remainingKcal / CALORIE_VALUES.carbs);
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;
  
  // 4. Calculate percentages of VET
  const proteinPercentage = Math.round((proteinKcal / vet) * 100);
  const fatPercentage = Math.round((fatKcal / vet) * 100);
  const carbsPercentage = Math.round((carbsKcal / vet) * 100);
  
  return {
    protein: { 
      grams: proteinGrams, 
      kcal: proteinKcal, 
      percentage: proteinPercentage,
      perKg: proteinPerKg
    },
    carbs: { 
      grams: carbsGrams, 
      kcal: carbsKcal, 
      percentage: carbsPercentage 
    },
    fat: { 
      grams: fatGrams, 
      kcal: fatKcal, 
      percentage: fatPercentage,
      perKg: fatPerKg
    }
  };
}

/**
 * Verifies if the macronutrient distribution is valid
 * Checks if the calculated macros add up to the expected VET within a margin of error
 */
export function validateMacroDistribution(
  proteinKcal: number,
  carbsKcal: number,
  fatKcal: number,
  vet: number
): boolean {
  const totalKcal = proteinKcal + carbsKcal + fatKcal;
  const differencePercentage = Math.abs((totalKcal - vet) / vet) * 100;
  
  // Allow for a small margin of error (1%)
  return differencePercentage <= 1;
}

/**
 * Helper function to estimate profile based on BMI
 * This is just a guideline - actual profile should be clinically determined
 */
export function estimateProfileFromBMI(bmi: number): Profile {
  if (bmi < 25) {
    return 'eutrofico';
  } else if (bmi >= 25) {
    return 'sobrepeso_obesidade';
  } else {
    return 'eutrofico'; // Default fallback
  }
}

/**
 * Calculate BMI from weight and height
 */
export function calculateBMI(weight: number, heightCm: number): number {
  // Convert height to meters if in cm
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}
