import { 
  Profile, 
  ActivityLevel, 
  Objective, 
  ACTIVITY_FACTORS, 
  OBJECTIVE_FACTORS, 
  PROTEIN_RATIOS, 
  LIPID_RATIOS 
} from '@/types/consultation';

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation
 */
export const calculateBMR = (weight: number, height: number, age: number, sex: 'M' | 'F'): number => {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values');
  }
  
  // Mifflin-St Jeor Equation
  return sex === 'M'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  const activityFactor = ACTIVITY_FACTORS[activityLevel];
  return bmr * activityFactor;
};

/**
 * Apply adjustment based on nutritional objective
 */
export const applyObjectiveAdjustment = (tdee: number, objective: Objective, customVET?: number): number => {
  // If a custom VET is provided, use that instead
  if (objective === 'personalizado' && customVET !== undefined && customVET > 0) {
    return customVET;
  }
  
  // Otherwise apply the standard adjustment factor
  const adjustmentFactor = OBJECTIVE_FACTORS[objective];
  return tdee * adjustmentFactor;
};

/**
 * Calculate macronutrient distribution based on profile and adjusted TDEE
 */
export const calculateMacros = (
  weight: number, 
  adjustedTDEE: number, 
  profile: Profile
): { protein: number; carbs: number; fat: number } => {
  // Get protein ratio based on profile
  const proteinRatio = PROTEIN_RATIOS[profile];
  const protein = weight * proteinRatio;
  
  // Get fat ratio based on profile
  const fatRatio = LIPID_RATIOS[profile];
  const fat = weight * fatRatio;
  
  // Calculate protein and fat calories
  const proteinCals = protein * 4; // 4 calories per gram
  const fatCals = fat * 9; // 9 calories per gram
  
  // Calculate remaining calories for carbs
  const remainingCals = adjustedTDEE - proteinCals - fatCals;
  const carbs = Math.max(0, remainingCals / 4); // 4 calories per gram
  
  return {
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat)
  };
};

/**
 * Full nutritional calculation workflow
 */
export const calculateNutrition = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile,
  customVET?: number
): {
  bmr: number;
  tdee: number;
  adjustedTDEE: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
} => {
  // Calculate BMR
  const bmr = calculateBMR(weight, height, age, sex);
  
  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Apply objective adjustment
  const adjustedTDEE = applyObjectiveAdjustment(tdee, objective, customVET);
  
  // Calculate macronutrients
  const macros = calculateMacros(weight, adjustedTDEE, profile);
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    adjustedTDEE: Math.round(adjustedTDEE),
    macros
  };
};
