import { 
  AnthropometryData,
  Profile,
  ActivityLevel,
  Objective,
  PROTEIN_RATIOS,
  LIPID_RATIOS, 
  CALORIE_VALUES,
  ACTIVITY_FACTORS,
  OBJECTIVE_FACTORS,
  CalculatedMacros,
  NutritionCalculation
} from '@/types/nutrition';

/**
 * Validate anthropometry inputs
 * @param data Anthropometry data
 * @returns boolean indicating if all data is valid
 */
export function validateAnthropometryData(data: Partial<AnthropometryData>): boolean {
  const { weight, height, age } = data;
  
  return !!weight && 
         weight > 0 && weight <= 500 && 
         !!height && 
         height > 0 && height <= 250 && 
         !!age && 
         age > 0 && age <= 120;
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * @param data Anthropometry data (weight, height, age, gender)
 * @returns BMR in Kcal
 */
export function calculateBMR(data: AnthropometryData): number {
  if (!validateAnthropometryData(data)) {
    throw new Error('Invalid anthropometry data for BMR calculation');
  }

  const { weight, height, age, gender } = data;
  
  // Mifflin-St Jeor formula
  if (gender === 'M') {
    // Men: (10 * weight) + (6.25 * height) - (5 * age) + 5
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    // Women: (10 * weight) + (6.25 * height) - (5 * age) - 161
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param bmr Basal Metabolic Rate
 * @param activityLevel Activity level of the patient
 * @returns TDEE in Kcal
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  if (bmr <= 0) {
    throw new Error('BMR must be greater than 0');
  }
  
  const factor = ACTIVITY_FACTORS[activityLevel];
  if (!factor) {
    throw new Error(`Invalid activity level: ${activityLevel}`);
  }
  
  return Math.round(bmr * factor);
}

/**
 * Calculate adjusted calorie target based on objective
 * @param tdee Total Daily Energy Expenditure
 * @param objective Patient's goal (weight maintenance, loss, or gain)
 * @param customCalories Optional custom calorie target
 * @returns VET (adjusted calorie target) in Kcal
 */
export function calculateVET(tdee: number, objective: Objective, customCalories?: number | null): {
  vet: number;
  adjustment: number;
} {
  if (tdee <= 0) {
    throw new Error('TDEE must be greater than 0');
  }
  
  // If custom calories are provided, use them directly
  if (typeof customCalories === 'number' && customCalories > 0) {
    return {
      vet: customCalories,
      adjustment: customCalories - tdee
    };
  }
  
  // Otherwise apply standard adjustment based on objective
  let factor = 1.0;
  
  if (objective !== 'personalizado') {
    factor = OBJECTIVE_FACTORS[objective];
  }
  
  const vet = Math.round(tdee * factor);
  const adjustment = vet - tdee;
  
  return { vet, adjustment };
}

/**
 * Calculate macronutrient distribution based on profile and weight
 * @param profile Patient profile
 * @param weight Patient weight in kg
 * @param vet VET (adjusted calorie target) in Kcal
 * @returns Calculated macros with grams, kcal and percentages
 */
export function calculateMacrosByProfile(
  profile: Profile,
  weight: number,
  vet: number
): CalculatedMacros {
  if (!weight || weight <= 0 || !vet || vet <= 0) {
    throw new Error('Invalid input for macronutrient calculation');
  }

  // Get appropriate protein ratio based on profile
  const proteinPerKg = PROTEIN_RATIOS[profile];
  if (!proteinPerKg) {
    throw new Error(`Invalid profile: ${profile}`);
  }

  // Calculate protein grams
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // Get appropriate lipid ratio based on profile
  const fatPerKg = LIPID_RATIOS[profile];

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
    proteinPerKg
  };
}

/**
 * Calculate BMI (Body Mass Index)
 * @param weight Weight in kg
 * @param height Height in cm
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be greater than 0');
  }
  
  // Convert height to meters if in cm
  const heightInMeters = height >= 100 ? height / 100 : height;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

/**
 * Portuguese alias for calculateBMI
 */
export const calculateIMC = calculateBMI;

/**
 * Calculate Waist-Hip Ratio
 * @param waist Waist circumference in cm
 * @param hip Hip circumference in cm
 * @returns Waist-Hip Ratio
 */
export function calculateRCQ(waist: number, hip: number): number {
  if (waist <= 0 || hip <= 0) {
    throw new Error('Waist and hip measurements must be greater than 0');
  }
  
  return Number((waist / hip).toFixed(2));
}

/**
 * Calculate body fat percentage using Jackson-Pollock equation
 * @param gender Gender ('M' or 'F')
 * @param age Age in years
 * @param waist Waist circumference in cm
 * @param hip Hip circumference in cm
 * @param neck Neck circumference in cm
 * @returns Body fat percentage
 */
export function calculateBodyFat(
  gender: string,
  age: number,
  waist: number,
  hip?: number,
  neck?: number
): number {
  if (age <= 0 || waist <= 0) {
    throw new Error('Age and waist must be greater than 0');
  }
  
  if (gender === 'M') {
    return Number((10.1 - 0.2 * age + 0.8 * waist - 0.3 * (neck || 0)).toFixed(1));
  } else {
    return Number((19.2 - 0.1 * age + 0.8 * waist - 0.3 * (hip || 0) - 0.5 * (neck || 0)).toFixed(1));
  }
}

/**
 * Calculate lean mass
 * @param weight Total weight in kg
 * @param bodyFatPct Body fat percentage
 * @returns Lean mass in kg
 */
export function calculateLeanMass(weight: number, bodyFatPct: number): number {
  if (weight <= 0 || bodyFatPct < 0 || bodyFatPct > 100) {
    throw new Error('Weight must be greater than 0 and body fat percentage must be between 0 and 100');
  }
  
  return Number((weight * (1 - bodyFatPct / 100)).toFixed(1));
}

/**
 * Perform a complete nutrition calculation
 * @param data Anthropometry data
 * @param activityLevel Activity level
 * @param objective Nutritional objective
 * @param profile Patient profile
 * @param customCalories Optional custom calorie target
 * @returns Complete nutrition calculation result
 */
export function performNutritionCalculation(
  data: AnthropometryData,
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile,
  customCalories?: number | null
): NutritionCalculation {
  // Calculate BMR
  const bmr = calculateBMR(data);
  
  // Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);
  
  // Calculate VET
  const { vet, adjustment } = calculateVET(tdee, objective, customCalories);
  
  // Calculate macros
  const macros = calculateMacrosByProfile(profile, data.weight, vet);
  
  return {
    bmr,
    tdee,
    vet,
    adjustment,
    macros
  };
}
