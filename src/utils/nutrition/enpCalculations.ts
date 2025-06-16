
/**
 * Cálculos ENP - Sistema principal para todas as fórmulas
 * Garante consistência e precisão em todos os cálculos
 */

import { 
  PROTEIN_RATIOS, 
  LIPID_RATIOS, 
  CALORIE_VALUES,
  ActivityLevel,
  Objective,
  Profile
} from '@/types/consultation';

export interface ENPMacroResult {
  protein: { grams: number; kcal: number };
  carbs: { grams: number; kcal: number };
  fat: { grams: number; kcal: number };
}

/**
 * Calcula TMB usando Harris-Benedict Revisada (padrão ENP)
 */
export function calculateTMB_ENP(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F'
): number {
  if (sex === 'M') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Calcula GEA (Gasto Energético de Atividade)
 */
export function calculateGEA_ENP(
  tmb: number,
  activityLevel: ActivityLevel
): number {
  const factors = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muito_intenso: 1.9
  };
  
  const factor = factors[activityLevel] || 1.55;
  return Math.round(tmb * factor);
}

/**
 * Calcula GET (Gasto Energético Total) com ajuste por objetivo
 */
export function calculateGET_ENP(
  gea: number,
  objective: Objective
): number {
  switch (objective) {
    case 'emagrecimento':
      return gea - 500; // Déficit de 500 kcal conforme ENP
    case 'hipertrofia':
      return gea + 400; // Superávit de 400 kcal conforme ENP
    case 'manutenção':
    default:
      return gea; // Sem ajuste
  }
}

/**
 * Calcula macronutrientes seguindo padrões ENP
 * Proteína e lipídios por g/kg, carboidratos por diferença
 */
export function calculateMacros_ENP(
  get: number,
  weight: number,
  objective: Objective,
  profile: Profile
): ENPMacroResult {
  // 1. Calcular proteína (g/kg conforme perfil)
  const proteinGramsPerKg = PROTEIN_RATIOS[profile];
  const proteinGrams = Math.round(weight * proteinGramsPerKg);
  const proteinKcal = proteinGrams * CALORIE_VALUES.protein;

  // 2. Calcular lipídios (g/kg conforme perfil)  
  const fatGramsPerKg = LIPID_RATIOS[profile];
  const fatGrams = Math.round(weight * fatGramsPerKg);
  const fatKcal = fatGrams * CALORIE_VALUES.fat;

  // 3. Calcular carboidratos por diferença
  const carbsKcal = get - proteinKcal - fatKcal;
  const carbsGrams = Math.round(Math.max(0, carbsKcal) / CALORIE_VALUES.carbs);

  // Ajustar se carboidratos ficaram negativos
  let finalCarbsGrams = carbsGrams;
  let finalCarbsKcal = carbsKcal;
  
  if (carbsKcal < 0) {
    // Se GET é muito baixo, reduzir proporcionalmente proteína e gordura
    const totalProteinFat = proteinKcal + fatKcal;
    const reductionFactor = get / totalProteinFat;
    
    const adjustedProteinKcal = Math.round(proteinKcal * reductionFactor);
    const adjustedFatKcal = Math.round(fatKcal * reductionFactor);
    
    finalCarbsGrams = Math.round(Math.max(get * 0.1, 50) / CALORIE_VALUES.carbs); // Mínimo 10% ou 50g
    finalCarbsKcal = finalCarbsGrams * CALORIE_VALUES.carbs;
    
    console.warn('GET muito baixo, ajustando distribuição de macronutrientes');
  }

  return {
    protein: {
      grams: proteinGrams,
      kcal: proteinKcal
    },
    carbs: {
      grams: finalCarbsGrams,
      kcal: finalCarbsKcal
    },
    fat: {
      grams: fatGrams,
      kcal: fatKcal
    }
  };
}

/**
 * Validação completa dos parâmetros ENP
 */
export function validateENPParameters(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validações antropométricas
  if (!weight || weight <= 0 || weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (!height || height <= 0 || height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (!age || age <= 0 || age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  // Validações de dados categóricos
  if (!['M', 'F'].includes(sex)) {
    errors.push('Sexo deve ser M ou F');
  }

  if (!Object.keys(PROTEIN_RATIOS).includes(profile)) {
    errors.push('Perfil corporal inválido');
  }

  // Validações de consistência
  if (weight && height) {
    const imc = weight / Math.pow(height / 100, 2);
    if (imc < 10 || imc > 60) {
      errors.push(`IMC calculado (${imc.toFixed(1)}) está fora da faixa esperada`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
