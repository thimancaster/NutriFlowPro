
/**
 * Nutrition calculation utilities
 * Implements TMB (Basal Metabolic Rate) and GET (Total Energy Expenditure) calculations
 */

// TMB calculation for lean individuals
export function tmbMagrasMulheres(weight: number, height: number, age: number): number {
  return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
}

export function tmbMagrosHomens(weight: number, height: number, age: number): number {
  return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
}

// TMB calculation for overweight/obese individuals
export function tmbObesasMulheres(weight: number, height: number, age: number): number {
  return (10 * weight) + (6.25 * height) - (5 * age) - 161;
}

export function tmbObesosHomens(weight: number, height: number, age: number): number {
  return (10 * weight) + (6.25 * height) - (5 * age) + 5;
}

// TMB calculation for athletes
export function tmbAtletasMulheres(weight: number, height: number, age: number, bodyFat: number = 20): number {
  return 370 + (21.6 * (weight * (1 - (bodyFat / 100))));
}

export function tmbAtletasHomens(weight: number, height: number, age: number, bodyFat: number = 15): number {
  return 370 + (21.6 * (weight * (1 - (bodyFat / 100))));
}

// GET calculation
export function calcGET(tmb: number, activityFactor: number): number {
  return tmb * activityFactor;
}

// Default activity factors
export const activityFactors = {
  sedentário: 1.2,
  moderado: 1.55,
  alto: 1.9
};

// Calculate macronutrients based on GET and objective
export function calculateMacros(get: number, objective: string = 'manutenção') {
  let proteinPercentage = 0;
  let carbsPercentage = 0;
  let fatPercentage = 0;
  
  switch (objective) {
    case 'emagrecimento':
      proteinPercentage = 0.35;
      carbsPercentage = 0.30;
      fatPercentage = 0.35;
      break;
    case 'manutenção':
      proteinPercentage = 0.30;
      carbsPercentage = 0.40;
      fatPercentage = 0.30;
      break;
    case 'hipertrofia':
      proteinPercentage = 0.30;
      carbsPercentage = 0.50;
      fatPercentage = 0.20;
      break;
    default:
      proteinPercentage = 0.20;
      carbsPercentage = 0.50;
      fatPercentage = 0.30;
  }
  
  const protein = Math.round((get * proteinPercentage) / 4); // 4 calories per gram
  const carbs = Math.round((get * carbsPercentage) / 4);     // 4 calories per gram
  const fat = Math.round((get * fatPercentage) / 9);         // 9 calories per gram
  
  return {
    protein,
    carbs,
    fat
  };
}

// Validate inputs to prevent calculation errors
export function validateInputs(weight: number, height: number, age: number): boolean {
  return weight > 0 && height > 0 && age > 0;
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
    throw new Error('Invalid inputs: weight, height, and age must be greater than 0');
  }
  
  if (profile === 'magro') {
    return sex === 'M' ? tmbMagrosHomens(weight, height, age) : tmbMagrasMulheres(weight, height, age);
  } else if (profile === 'obeso') {
    return sex === 'M' ? tmbObesosHomens(weight, height, age) : tmbObesasMulheres(weight, height, age);
  } else if (profile === 'atleta') {
    return sex === 'M' ? 
      tmbAtletasHomens(weight, height, age, bodyFat) : 
      tmbAtletasMulheres(weight, height, age, bodyFat);
  }
  
  // Default to lean formula
  return sex === 'M' ? tmbMagrosHomens(weight, height, age) : tmbMagrasMulheres(weight, height, age);
}
