
/**
 * Calculate BMR based on gender, weight, height and age using Mifflin-St Jeor formula
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
    // Men: (10 * weight) + (6.25 * height) - (5 * age) + 5
    calculatedBmr = (10 * weightVal) + (6.25 * heightVal) - (5 * ageVal) + 5;
  } else {
    // Women: (10 * weight) + (6.25 * height) - (5 * age) - 161
    calculatedBmr = (10 * weightVal) + (6.25 * heightVal) - (5 * ageVal) - 161;
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
  fatPercentage: string,
  weightKg: number
) {
  const carbsPercent = parseFloat(carbsPercentage) / 100;
  const proteinPercent = parseFloat(proteinPercentage) / 100;
  const fatPercent = parseFloat(fatPercentage) / 100;
  
  const carbs = Math.round((tee * carbsPercent) / 4); // 4 calories per gram of carbs
  const protein = Math.round((tee * proteinPercent) / 4); // 4 calories per gram of protein
  const fat = Math.round((tee * fatPercent) / 9); // 9 calories per gram of fat
  
  // Calculate protein per kg
  const proteinPerKg = weightKg > 0 ? parseFloat((protein / weightKg).toFixed(2)) : 0;
  
  return {
    carbs,
    protein,
    fat,
    proteinPerKg
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
  
  return activityFactors[activityLevel.toLowerCase()] || 1.55; // Default to moderate if not found
}

/**
 * Calculate caloric adjustment based on objective
 */
export function getCaloricAdjustment(objective: string): number {
  const adjustments: Record<string, number> = {
    'emagrecimento': -500,
    'manutenção': 0,
    'hipertrofia': 300
  };
  
  return adjustments[objective.toLowerCase()] || 0;
}

/**
 * Calculate Total Energy Expenditure with adjustments
 */
export function calculateTEE(bmr: number, activityLevel: string, objective: string): {
  get: number;
  adjustment: number;
  vet: number;
} {
  const activityFactor = getActivityFactor(activityLevel);
  const get = Math.round(bmr * activityFactor);
  const adjustment = getCaloricAdjustment(objective);
  const vet = get + adjustment;
  
  return {
    get,
    adjustment,
    vet
  };
}
