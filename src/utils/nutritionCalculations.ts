
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
  // 1. Calcular proteínas baseado no perfil e peso
  const proteinRatio = PROTEIN_RATIOS[profile];
  const proteinGrams = weight * proteinRatio;
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;
  
  // 2. Calcular gorduras baseado no perfil e peso
  const fatRatio = LIPID_RATIOS[profile];
  const fatGrams = weight * fatRatio;
  const fatKcal = fatGrams * CALORIE_VALUES.fat;
  
  // 3. Calcular carboidratos com as calorias restantes
  const remainingKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, remainingKcal / CALORIE_VALUES.carbs);
  const carbsKcal = carbsGrams * CALORIE_VALUES.carbs;
  
  // 4. Calcular percentuais
  const proteinPercentage = (proteinKcal / vet) * 100;
  const carbsPercentage = (carbsKcal / vet) * 100;
  const fatPercentage = (fatKcal / vet) * 100;
  
  return {
    protein: {
      grams: Math.round(proteinGrams),
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercentage)
    },
    carbs: {
      grams: Math.round(carbsGrams),
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercentage)
    },
    fat: {
      grams: Math.round(fatGrams),
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercentage)
    },
    proteinPerKg: proteinRatio
  };
};

/**
 * Função principal de cálculo nutricional completo
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
  adjustment: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  formulaUsed: string;
} => {
  // 1. Calcular TMB usando a fórmula apropriada para o perfil
  const tmb = calculateTMB(weight, height, age, sex, profile);
  
  // 2. Calcular GET aplicando fator de atividade
  const get = calculateGET(tmb, activityLevel, profile);
  
  // 3. Calcular VET aplicando ajuste do objetivo
  const vet = calculateVET(get, objective);
  
  // 4. Calcular ajuste calórico
  const adjustment = vet - get;
  
  // 5. Calcular macronutrientes
  const macros = calculateMacrosByProfile(profile, weight, vet, objective);
  
  // 6. Determinar fórmula usada
  let formulaUsed = '';
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
      formulaUsed = 'Harris-Benedict Revisada';
  }
  
  return {
    tmb,
    get,
    vet,
    adjustment,
    macros,
    formulaUsed
  };
};

/**
 * Validação de dados de entrada
 */
export const validateNutritionInputs = (
  weight: number,
  height: number,
  age: number
): string | null => {
  if (weight <= 0 || weight > 500) {
    return 'Peso deve estar entre 1 e 500 kg';
  }
  
  if (height <= 0 || height > 250) {
    return 'Altura deve estar entre 1 e 250 cm';
  }
  
  if (age <= 0 || age > 120) {
    return 'Idade deve estar entre 1 e 120 anos';
  }
  
  return null;
};
