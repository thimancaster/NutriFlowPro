
/**
 * Nutrition calculation utilities
 * Implements TMB (Basal Metabolic Rate) and GET (Total Energy Expenditure) calculations
 */

// TMB calculation for women (Eutróficas ativas)
export function tmbMagrasMulheres(weight: number, height: number, age: number): number {
  // Harris-Benedict formula for women
  return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
}

// TMB calculation for men (Eutróficos ativos)
export function tmbMagrosHomens(weight: number, height: number, age: number): number {
  // Harris-Benedict formula for men
  return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
}

// TMB calculation for overweight/obese individuals
export function tmbObesasMulheres(weight: number, height: number, age: number): number {
  // Mifflin-St Jeor formula for women
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

export function tmbObesosHomens(weight: number, height: number, age: number): number {
  // Mifflin-St Jeor formula for men
  return (10 * weight) + (6.25 * height) - (5 * age) + 5;
}

// TMB calculation for athletes
export function tmbAtletasMulheres(weight: number, height: number, age: number, bodyFat: number = 20): number {
  return 370 + (21.6 * (weight * (1 - (bodyFat / 100))));
}

export function tmbAtletasHomens(weight: number, height: number, age: number, bodyFat: number = 15): number {
  return 370 + (21.6 * (weight * (1 - (bodyFat / 100))));
}

// GET calculation with exact activity factors matching the spreadsheet
export function calcGET(tmb: number, activityFactor: number): number {
  return Math.round(tmb * activityFactor);
}

// Activity factors exactly matching the spreadsheet
export const activityFactors = {
  sedentário: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9
};

// Calculate macronutrients based on GET and macronutrient distribution
export function calculateMacros(get: number, proteinPercentage: number = 0.20, carbsPercentage: number = 0.55, fatPercentage: number = 0.25) {
  // Standard distribution: 20% protein, 55% carbs, 25% fat
  const protein = Math.round((get * proteinPercentage) / 4); // 4 calories per gram
  const carbs = Math.round((get * carbsPercentage) / 4);     // 4 calories per gram
  const fat = Math.round((get * fatPercentage) / 9);         // 9 calories per gram
  
  return { protein, carbs, fat };
}

// Validate inputs to prevent calculation errors - enforcing plausible limits
export function validateInputs(weight: number, height: number, age: number): boolean {
  return weight > 0 && weight <= 300 && 
         height > 0 && height <= 250 && 
         age > 0 && age <= 120;
}

// IMC calculation
export function calculateIMC(weight: number, height: number): number {
  // Convert height to meters if in cm
  const heightInMeters = height >= 100 ? height / 100 : height;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

// RCQ calculation (Relação Cintura-Quadril)
export function calculateRCQ(waistCircumference: number, hipCircumference: number): number {
  return Number((waistCircumference / hipCircumference).toFixed(2));
}

// Calculate body fat percentage using Jackson & Pollock formula
export function calculateBodyFatJacksonPollock(
  gender: 'M' | 'F',
  age: number,
  folds: {
    triceps?: number;
    subscapular?: number;
    suprailiac?: number;
    abdominal?: number;
    thigh?: number;
    chest?: number;
  }
): number {
  // 3-fold formula for men (chest, abdomen, thigh)
  if (gender === 'M' && folds.chest && folds.abdominal && folds.thigh) {
    const sumFolds = folds.chest + folds.abdominal + folds.thigh;
    const bodyDensity = 1.10938 - (0.0008267 * sumFolds) + (0.0000016 * sumFolds * sumFolds) - (0.0002574 * age);
    return Number((((4.95 / bodyDensity) - 4.5) * 100).toFixed(1));
  }
  
  // 3-fold formula for women (triceps, suprailiac, thigh)
  if (gender === 'F' && folds.triceps && folds.suprailiac && folds.thigh) {
    const sumFolds = folds.triceps + folds.suprailiac + folds.thigh;
    const bodyDensity = 1.099421 - (0.0009929 * sumFolds) + (0.0000023 * sumFolds * sumFolds) - (0.0001392 * age);
    return Number((((4.95 / bodyDensity) - 4.5) * 100).toFixed(1));
  }
  
  // 7-fold formula (if all measurements available)
  if (folds.triceps && folds.subscapular && folds.chest && folds.suprailiac && 
      folds.abdominal && folds.thigh) {
    const sumFolds = folds.triceps + folds.subscapular + folds.chest + 
                    folds.suprailiac + folds.abdominal + folds.thigh;
    
    let bodyDensity;
    if (gender === 'M') {
      bodyDensity = 1.112 - (0.00043499 * sumFolds) + (0.00000055 * sumFolds * sumFolds) - (0.00028826 * age);
    } else {
      bodyDensity = 1.097 - (0.00046971 * sumFolds) + (0.00000056 * sumFolds * sumFolds) - (0.00012828 * age);
    }
    
    return Number((((4.95 / bodyDensity) - 4.5) * 100).toFixed(1));
  }
  
  // If not enough measurements are available, return an estimate based on BMI
  // This is just a fallback and not accurate
  return 0;
}

// Calculate lean mass based on weight and body fat percentage
export function calculateLeanMass(weight: number, bodyFatPercentage: number): number {
  return Number((weight * (1 - (bodyFatPercentage / 100))).toFixed(1));
}

// Calculate TMB based on profile and gender
export function calculateTMB(
  weight: number, 
  height: number, 
  age: number, 
  sex: 'M' | 'F', 
  profile: 'magro' | 'obeso' | 'atleta',
  bodyFat?: number
): number {
  if (!validateInputs(weight, height, age)) {
    throw new Error('Invalid inputs: weight, height, and age must be within reasonable ranges');
  }
  
  if (profile === 'magro') {
    return Math.round(sex === 'M' ? tmbMagrosHomens(weight, height, age) : tmbMagrasMulheres(weight, height, age));
  } else if (profile === 'obeso') {
    return Math.round(sex === 'M' ? tmbObesosHomens(weight, height, age) : tmbObesasMulheres(weight, height, age));
  } else if (profile === 'atleta') {
    return Math.round(sex === 'M' ? 
      tmbAtletasHomens(weight, height, age, bodyFat) : 
      tmbAtletasMulheres(weight, height, age, bodyFat));
  }
  
  // Default to lean formula
  return Math.round(sex === 'M' ? tmbMagrosHomens(weight, height, age) : tmbMagrasMulheres(weight, height, age));
}

// Calculate meal distribution percentages
export function getMealDistribution() {
  return {
    breakfast: { protein: 15, carbs: 25, fat: 20 },
    morningSnack: { protein: 15, carbs: 15, fat: 10 },
    lunch: { protein: 20, carbs: 20, fat: 20 },
    afternoonSnack: { protein: 15, carbs: 10, fat: 10 },
    dinner: { protein: 15, carbs: 15, fat: 20 },
    eveningSnack: { protein: 20, carbs: 15, fat: 20 }
  };
}
