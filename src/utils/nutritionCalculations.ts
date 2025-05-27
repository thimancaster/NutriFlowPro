
import { 
  Profile, 
  ActivityLevel, 
  Objective, 
  ACTIVITY_FACTORS, 
  OBJECTIVE_FACTORS, 
  PROTEIN_RATIOS, 
  LIPID_RATIOS,
  CALORIE_VALUES 
} from '@/types/consultation';

/**
 * Calcula TMB usando a fórmula correta baseada no perfil
 */
export const calculateTMB = (weight: number, height: number, age: number, sex: 'M' | 'F', profile: Profile): number => {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values');
  }
  
  let tmb: number;
  
  switch (profile) {
    case 'eutrofico':
      // Harris-Benedict revisada para perfil eutrófico
      if (sex === 'M') {
        tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      break;
      
    case 'sobrepeso_obesidade':
      // Mifflin-St Jeor para sobrepeso/obesidade
      if (sex === 'M') {
        tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      } else {
        tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      }
      break;
      
    case 'atleta':
      // Cunningham para atletas (aproximação quando massa magra não disponível)
      // Assumindo 10-15% de gordura corporal para atletas
      const estimatedLeanMass = weight * 0.85; // 15% gordura
      tmb = 500 + (22 * estimatedLeanMass);
      break;
      
    default:
      // Fallback para Harris-Benedict revisada
      if (sex === 'M') {
        tmb = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        tmb = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
  }
  
  return Math.round(tmb);
};

/**
 * Calcula GET usando fatores de atividade específicos por perfil
 */
export const calculateGET = (tmb: number, activityLevel: ActivityLevel, profile: Profile): number => {
  let activityFactor: number;
  
  // Fatores de atividade específicos por perfil conforme planilha
  switch (profile) {
    case 'eutrofico':
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.2; break;
        case 'leve': activityFactor = 1.375; break;
        case 'moderado': activityFactor = 1.55; break;
        case 'intenso': activityFactor = 1.725; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.2;
      }
      break;
      
    case 'sobrepeso_obesidade':
      // Fatores reduzidos para perfil com sobrepeso/obesidade
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.1; break;
        case 'leve': activityFactor = 1.3; break;
        case 'moderado': activityFactor = 1.5; break;
        case 'intenso': activityFactor = 1.7; break;
        case 'muito_intenso': activityFactor = 1.9; break;
        default: activityFactor = 1.1;
      }
      break;
      
    case 'atleta':
      // Fatores aumentados para atletas
      switch (activityLevel) {
        case 'sedentario': activityFactor = 1.5; break;
        case 'leve': activityFactor = 1.6; break;
        case 'moderado': activityFactor = 1.8; break;
        case 'intenso': activityFactor = 2.1; break;
        case 'muito_intenso': activityFactor = 2.4; break;
        default: activityFactor = 1.5;
      }
      break;
      
    default:
      activityFactor = ACTIVITY_FACTORS[activityLevel] || 1.2;
  }
  
  return Math.round(tmb * activityFactor);
};

/**
 * Calcula VET aplicando ajuste baseado no objetivo
 */
export const calculateVET = (get: number, objective: Objective): number => {
  let adjustmentFactor: number;
  
  switch (objective) {
    case 'emagrecimento':
      adjustmentFactor = 0.8; // Déficit de 20%
      break;
    case 'hipertrofia':
      adjustmentFactor = 1.15; // Superávit de 15%
      break;
    case 'manutenção':
    case 'personalizado':
    default:
      adjustmentFactor = 1.0; // Sem ajuste
  }
  
  return Math.round(get * adjustmentFactor);
};

/**
 * Calcula macronutrientes seguindo a lógica sequencial da planilha
 */
export const calculateMacrosByProfile = (
  profile: Profile,
  weight: number,
  vet: number,
  objective: Objective
): {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
  proteinPerKg: number;
} => {
  if (!weight || weight <= 0 || !vet || vet <= 0) {
    throw new Error('Invalid input for macronutrient calculation');
  }

  // 1º PASSO: Calcular proteínas (g/kg baseado no perfil e objetivo)
  let proteinPerKg: number;
  
  switch (profile) {
    case 'eutrofico':
      proteinPerKg = objective === 'emagrecimento' ? 1.4 : 1.2;
      break;
    case 'sobrepeso_obesidade':
      proteinPerKg = objective === 'emagrecimento' ? 2.2 : 2.0;
      break;
    case 'atleta':
      proteinPerKg = objective === 'hipertrofia' ? 2.0 : 1.8;
      break;
    default:
      proteinPerKg = 1.2;
  }
  
  const proteinGrams = Math.round(weight * proteinPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // 2º PASSO: Calcular gorduras (g/kg baseado no perfil)
  let fatPerKg: number;
  
  switch (profile) {
    case 'eutrofico':
      fatPerKg = 1.0;
      break;
    case 'sobrepeso_obesidade':
      fatPerKg = 0.8;
      break;
    case 'atleta':
      fatPerKg = 1.2;
      break;
    default:
      fatPerKg = 1.0;
  }
  
  const fatGrams = Math.round(weight * fatPerKg);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;

  // 3º PASSO: Calcular carboidratos por diferença
  const remainingKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, Math.round(remainingKcal / CALORIE_VALUES.carbs));
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;

  // 4º PASSO: Calcular percentuais como saída
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

/**
 * Cálculo completo de nutrição seguindo a lógica da planilha
 */
export const calculateCompleteNutrition = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile
): {
  tmb: number;
  get: number;
  vet: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  formulaUsed: string;
} => {
  // Calcular TMB usando fórmula específica do perfil
  const tmb = calculateTMB(weight, height, age, sex, profile);
  
  // Calcular GET usando fatores específicos do perfil
  const get = calculateGET(tmb, activityLevel, profile);
  
  // Calcular VET aplicando ajuste do objetivo
  const vet = calculateVET(get, objective);
  
  // Calcular macronutrientes seguindo lógica sequencial
  const macros = calculateMacrosByProfile(profile, weight, vet, objective);
  
  // Determinar qual fórmula foi usada
  let formulaUsed: string;
  switch (profile) {
    case 'eutrofico':
      formulaUsed = 'Harris-Benedict Revisada';
      break;
    case 'sobrepeso_obesidade':
      formulaUsed = 'Mifflin-St Jeor';
      break;
    case 'atleta':
      formulaUsed = 'Cunningham (estimativa)';
      break;
    default:
      formulaUsed = 'Harris-Benedict Revisada (padrão)';
  }
  
  return {
    tmb,
    get,
    vet,
    macros,
    formulaUsed
  };
};

// Additional utility functions for anthropometry calculations
export const calculateIMC = (weight: number, height: number): number => {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

export const calculateRCQ = (waistCircumference: number, hipCircumference: number): number => {
  if (waistCircumference <= 0 || hipCircumference <= 0) {
    throw new Error('Waist and hip circumferences must be positive values');
  }
  return Math.round((waistCircumference / hipCircumference) * 100) / 100;
};

export const calculateBodyFatJacksonPollock = (
  age: number,
  sex: 'M' | 'F',
  skinFolds: { chest?: number; abdomen?: number; thigh?: number; triceps?: number; suprailiac?: number; subscapular?: number }
): number => {
  // Jackson-Pollock 3-point formula
  let bodyDensity: number;
  
  if (sex === 'M') {
    const sum = (skinFolds.chest || 0) + (skinFolds.abdomen || 0) + (skinFolds.thigh || 0);
    bodyDensity = 1.10938 - (0.0008267 * sum) + (0.0000016 * sum * sum) - (0.0002574 * age);
  } else {
    const sum = (skinFolds.triceps || 0) + (skinFolds.suprailiac || 0) + (skinFolds.thigh || 0);
    bodyDensity = 1.0994921 - (0.0009929 * sum) + (0.0000023 * sum * sum) - (0.0001392 * age);
  }
  
  const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
  return Math.round(bodyFatPercentage * 10) / 10;
};

export const calculateLeanMass = (weight: number, bodyFatPercentage: number): number => {
  if (weight <= 0 || bodyFatPercentage < 0 || bodyFatPercentage > 100) {
    throw new Error('Invalid weight or body fat percentage');
  }
  return Math.round((weight * (1 - bodyFatPercentage / 100)) * 10) / 10;
};

export const calculateCalorieSummary = (
  targetCalories: number,
  macros: {
    protein: { kcal: number };
    fats: { kcal: number };
    carbs: { kcal: number };
  }
): {
  targetCalories: number;
  actualCalories: number;
  difference: number;
  percentageDifference: number;
} => {
  const actualCalories = macros.protein.kcal + macros.fats.kcal + macros.carbs.kcal;
  const difference = actualCalories - targetCalories;
  const percentageDifference = Math.round((difference / targetCalories) * 100);
  
  return {
    targetCalories,
    actualCalories,
    difference,
    percentageDifference
  };
};
