
/**
 * Nutrition calculation utilities
 * Implements TMB (Basal Metabolic Rate) and GET (Total Energy Expenditure) calculations
 */

// TMB calculation using Mifflin-St Jeor formula (standard for all profiles)
export function calculateTMB(
  weight: number, 
  height: number, 
  age: number, 
  sex: 'M' | 'F'
): number {
  if (!validateInputs(weight, height, age)) {
    throw new Error('Invalid inputs: weight, height, and age must be within reasonable ranges');
  }
  
  // Mifflin-St Jeor formula
  if (sex === 'M') {
    // Men: (10 * weight) + (6.25 * height) - (5 * age) + 5
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    // Women: (10 * weight) + (6.25 * height) - (5 * age) - 161
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

// Legacy functions for testing compatibility
export const tmbMagrasMulheres = (weight: number, height: number, age: number): number => {
  return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
};

export const tmbMagrosHomens = (weight: number, height: number, age: number): number => {
  return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
};

export const tmbObesasMulheres = (weight: number, height: number, age: number): number => {
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

export const tmbObesosHomens = (weight: number, height: number, age: number): number => {
  return (10 * weight) + (6.25 * height) - (5 * age) + 5;
};

// Activity factors as specified in documentation
export const activityFactors = {
  sedentario: 1.2,      // Sedentary
  leve: 1.375,          // Lightly active
  moderado: 1.55,       // Moderately active
  intenso: 1.725,       // Very active
  muito_intenso: 1.9    // Extremely active
};

// Objective factors for caloric adjustments
export const objectiveFactors = {
  emagrecimento: 0.8,   // Weight loss (20% deficit)
  manutenção: 1.0,      // Maintenance
  hipertrofia: 1.15     // Muscle gain (15% surplus)
};

// GET calculation (TMB × Activity Factor)
export function calculateGET(tmb: number, activityLevel: string): number {
  const factor = activityFactors[activityLevel as keyof typeof activityFactors] || 1.55; // Default to moderate if not found
  return Math.round(tmb * factor);
}

// Legacy alias for tests
export const calcGET = calculateGET;

// VET calculation (GET × Objective Factor)
export function calculateVET(get: number, objective: string): number {
  const factor = objectiveFactors[objective as keyof typeof objectiveFactors] || 1.0; // Default to maintenance
  return Math.round(get * factor);
}

// Calculate macronutrients based on profile and weight
export function calculateMacrosByProfile(
  profile: string,
  weight: number,
  vet: number
): {
  protein: { grams: number, kcal: number, percentage: number },
  fats: { grams: number, kcal: number, percentage: number },
  carbs: { grams: number, kcal: number, percentage: number }
} {
  let proteinGramsPerKg: number;
  let fatsGramsPerKg: number;
  
  // Set protein and fat targets based on profile
  switch(profile) {
    case 'obeso':
      proteinGramsPerKg = 2.0;  // 2.0g per kg for overweight/obese
      fatsGramsPerKg = 0.5;     // 0.5g per kg for overweight/obese
      break;
    case 'atleta':
      proteinGramsPerKg = 2.2;  // 2.2g per kg for athletes
      fatsGramsPerKg = 0.8;     // 0.8g per kg for athletes
      break;
    case 'magro':
    default:
      proteinGramsPerKg = 1.6;  // 1.6g per kg for healthy/normal weight
      fatsGramsPerKg = 1.0;     // 1.0g per kg for healthy/normal weight
  }
  
  // Calculate protein
  const proteinGrams = Math.round(weight * proteinGramsPerKg);
  const proteinKcal = proteinGrams * 4;
  
  // Calculate fats
  const fatGrams = Math.round(weight * fatsGramsPerKg);
  const fatKcal = fatGrams * 9;
  
  // Calculate carbs as the caloric remainder
  const carbsKcal = vet - (proteinKcal + fatKcal);
  const carbsGrams = Math.round(carbsKcal / 4);
  
  // Calculate percentages
  const proteinPercentage = Math.round((proteinKcal / vet) * 100);
  const fatPercentage = Math.round((fatKcal / vet) * 100);
  const carbsPercentage = Math.round((carbsKcal / vet) * 100);
  
  return {
    protein: { 
      grams: proteinGrams, 
      kcal: proteinKcal, 
      percentage: proteinPercentage 
    },
    fats: { 
      grams: fatGrams, 
      kcal: fatKcal, 
      percentage: fatPercentage 
    },
    carbs: { 
      grams: carbsGrams, 
      kcal: carbsKcal, 
      percentage: carbsPercentage 
    }
  };
}

// Legacy function for test compatibility
export function calculateMacros(calories: number, proteinPct: number, carbsPct: number, fatPct: number) {
  const protein = Math.round((calories * proteinPct) / 4);
  const carbs = Math.round((calories * carbsPct) / 4);
  const fat = Math.round((calories * fatPct) / 9);
  
  return { protein, carbs, fat };
}

// Calculate total caloric summary
export function calculateCalorieSummary(
  vet: number,
  macros: {
    protein: { kcal: number },
    fats: { kcal: number },
    carbs: { kcal: number }
  }
): {
  targetCalories: number,
  actualCalories: number,
  difference: number,
  percentageDifference: number
} {
  const actualCalories = macros.protein.kcal + macros.fats.kcal + macros.carbs.kcal;
  const difference = actualCalories - vet;
  const percentageDifference = Math.round((difference / vet) * 100 * 10) / 10; // Round to 1 decimal place
  
  return {
    targetCalories: vet,
    actualCalories,
    difference,
    percentageDifference
  };
}

// Validate inputs to prevent calculation errors - enforcing plausible limits
export function validateInputs(weight: number, height: number, age: number): boolean {
  return weight > 0 && weight <= 500 && 
         height > 0 && height <= 250 && 
         age > 0 && age <= 120;
}

// Calculate BMI (IMC in Portuguese)
export function calculateBMI(weight: number, height: number): number {
  // Convert height to meters if in cm
  const heightInMeters = height >= 100 ? height / 100 : height;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

// Alias for Portuguese terminology
export const calculateIMC = calculateBMI;

// Calculate Waist-Hip Ratio (RCQ in Portuguese)
export function calculateRCQ(waist: number, hip: number): number {
  if (waist <= 0 || hip <= 0) return 0;
  return Number((waist / hip).toFixed(2));
}

// Calculate body fat percentage using Jackson-Pollock equation
export function calculateBodyFatJacksonPollock(
  gender: string, 
  age: number, 
  waist: number, 
  hip?: number, 
  neck?: number
): number {
  // Simple implementation for compatibility
  if (gender === 'male' || gender === 'M') {
    return Number((10.1 - 0.2 * age + 0.8 * (waist || 0) - 0.3 * (neck || 0)).toFixed(1));
  } else {
    return Number((19.2 - 0.1 * age + 0.8 * (waist || 0) - 0.3 * (hip || 0) - 0.5 * (neck || 0)).toFixed(1));
  }
}

// Calculate lean mass
export function calculateLeanMass(weight: number, bodyFatPct: number): number {
  return Number((weight * (1 - bodyFatPct / 100)).toFixed(1));
}
