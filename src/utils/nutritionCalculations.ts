
import { Profile } from '@/types/consultation';

export interface NutritionCalculationParams {
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  activityLevel: string;
  objective: string;
  profile: Profile;
}

export interface NutritionResults {
  bmr: number;
  tdee: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Fórmula de Harris-Benedict revisada
const calculateBMR = (weight: number, height: number, age: number, sex: 'M' | 'F'): number => {
  if (sex === 'M') {
    return Math.round(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    return Math.round(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
  }
};

// Fatores de atividade
const ACTIVITY_FACTORS = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  extremo: 1.9
};

// Ajustes por objetivo
const OBJECTIVE_ADJUSTMENTS = {
  emagrecimento: -500,
  manutenção: 0,
  hipertrofia: 400
};

export const calculateENPNutrition = async (params: NutritionCalculationParams): Promise<NutritionResults> => {
  const { weight, height, age, sex, activityLevel, objective, profile } = params;

  // Calcular TMB
  const bmr = calculateBMR(weight, height, age, sex);
  
  // Calcular TDEE
  const activityFactor = ACTIVITY_FACTORS[activityLevel as keyof typeof ACTIVITY_FACTORS] || 1.55;
  const baseTdee = bmr * activityFactor;
  
  // Ajustar por objetivo
  const adjustment = OBJECTIVE_ADJUSTMENTS[objective as keyof typeof OBJECTIVE_ADJUSTMENTS] || 0;
  const tdee = Math.round(baseTdee + adjustment);

  // Calcular macronutrientes
  let proteinPerKg = 1.2; // Valor padrão
  
  // Ajustar proteína por perfil
  switch (profile) {
    case 'eutrofico':
      proteinPerKg = 1.2;
      break;
    case 'sobrepeso_obesidade':
      proteinPerKg = 1.4;
      break;
    case 'atleta':
      proteinPerKg = 1.6;
      break;
    default:
      proteinPerKg = 1.2;
  }

  // Ajustar proteína por objetivo
  if (objective === 'hipertrofia') {
    proteinPerKg += 0.4;
  }

  const protein = Math.round(weight * proteinPerKg);
  const proteinCalories = protein * 4;

  // Calcular gorduras (25-30% das calorias)
  const fatPercentage = 0.25;
  const fatCalories = Math.round(tdee * fatPercentage);
  const fats = Math.round(fatCalories / 9);

  // Calcular carboidratos (restante das calorias)
  const remainingCalories = tdee - proteinCalories - fatCalories;
  const carbs = Math.round(remainingCalories / 4);

  return {
    bmr,
    tdee,
    protein,
    carbs,
    fats
  };
};

// Add missing anthropometric calculation functions
export const calculateIMC = (weight: number, height: number): number => {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
};

export const calculateRCQ = (waist: number, hip: number): number => {
  return Math.round((waist / hip) * 100) / 100;
};

export const calculateBodyFatJacksonPollock = (sum3Folds: number, age: number, sex: 'M' | 'F'): number => {
  let bodyDensity: number;
  
  if (sex === 'M') {
    // Jackson & Pollock 3-site formula for men (chest, abdomen, thigh)
    bodyDensity = 1.10938 - (0.0008267 * sum3Folds) + (0.0000016 * sum3Folds * sum3Folds) - (0.0002574 * age);
  } else {
    // Jackson & Pollock 3-site formula for women (triceps, suprailiac, thigh)
    bodyDensity = 1.0994921 - (0.0009929 * sum3Folds) + (0.0000023 * sum3Folds * sum3Folds) - (0.0001392 * age);
  }
  
  // Convert body density to body fat percentage using Siri equation
  const bodyFat = ((4.95 / bodyDensity) - 4.5) * 100;
  return Math.round(bodyFat * 10) / 10;
};

export const calculateLeanMass = (weight: number, bodyFatPercentage: number): number => {
  const leanMass = weight * (1 - bodyFatPercentage / 100);
  return Math.round(leanMass * 10) / 10;
};

// Manter compatibilidade com outras funções existentes
export const calculateTMB = (weight: number, height: number, age: number, sex: 'M' | 'F'): number => {
  return calculateBMR(weight, height, age, sex);
};

export const calculateGET = (tmb: number, activityLevel: string): number => {
  const factor = ACTIVITY_FACTORS[activityLevel as keyof typeof ACTIVITY_FACTORS] || 1.55;
  return Math.round(tmb * factor);
};

export const calculateVET = (get: number, objective: string): number => {
  const adjustment = OBJECTIVE_ADJUSTMENTS[objective as keyof typeof OBJECTIVE_ADJUSTMENTS] || 0;
  return Math.round(get + adjustment);
};

export const calculateCalorieSummary = (vet: number, macros: any) => {
  return {
    totalCalories: vet,
    proteinCalories: macros.protein.kcal,
    carbsCalories: macros.carbs.kcal,
    fatCalories: macros.fats.kcal
  };
};
