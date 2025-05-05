
/**
 * Calculate BMR based on gender, weight, height and age
 */
export function calculateBMR(
  gender: string,
  weight: string,
  height: string,
  age: string
): number {
  const weightVal = parseFloat(weight);
  const heightVal = parseFloat(height);
  const ageVal = parseFloat(age);
  
  let calculatedBmr;
  if (gender === 'male') {
    // Men: 66 + (13.7 * weight) + (5 * height) - (6.8 * age)
    calculatedBmr = 66 + (13.7 * weightVal) + (5 * heightVal) - (6.8 * ageVal);
  } else {
    // Women: 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age)
    calculatedBmr = 655 + (9.6 * weightVal) + (1.8 * heightVal) - (4.7 * ageVal);
  }
  
  // Round TMB to the nearest whole number
  return Math.round(calculatedBmr);
}

/**
 * Calculate macronutrients based on TEE and distribution percentages
 */
export function calculateMacros(
  tee: number,
  carbsPercentage: string,
  proteinPercentage: string,
  fatPercentage: string
) {
  const carbsPercent = parseFloat(carbsPercentage) / 100;
  const proteinPercent = parseFloat(proteinPercentage) / 100;
  const fatPercent = parseFloat(fatPercentage) / 100;
  
  return {
    carbs: Math.round((tee * carbsPercent) / 4), // 4 calories per gram of carbs
    protein: Math.round((tee * proteinPercent) / 4), // 4 calories per gram of protein
    fat: Math.round((tee * fatPercent) / 9), // 9 calories per gram of fat
  };
}

/**
 * Calculate activity factor based on activity level selection
 */
export function getActivityFactor(activityLevel: string): number {
  const activityFactors: Record<string, number> = {
    'sedentario': 1.2,
    'leve': 1.375,
    'moderado': 1.55,
    'intenso': 1.725,
    'muito_intenso': 1.9
  };
  
  return activityFactors[activityLevel as keyof typeof activityFactors] || 1.2;
}
