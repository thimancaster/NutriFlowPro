
/**
 * MOTOR NUTRICIONAL CENTRAL - 100% FIEL À PLANILHA
 * 
 * Este é o motor definitivo que implementa EXATAMENTE todas as fórmulas,
 * parâmetros e regras da planilha central, sem exceções.
 * 
 * TODOS os cálculos nutricionais devem passar por este motor.
 */

export type ProfileType = 'eutrofico' | 'obeso_sobrepeso' | 'atleta';
export type Gender = 'M' | 'F';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo';
export type ObjectiveType = 'manutencao' | 'emagrecimento' | 'hipertrofia';

// CONSTANTES EXATAS DA PLANILHA CENTRAL
export const PLANILHA_CONSTANTS = {
  // Fatores de Atividade Física - EXATOS da planilha
  ACTIVITY_FACTORS: {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    muito_ativo: 1.725,
    extremamente_ativo: 1.9
  } as const,

  // Ajustes por Objetivo - EXATOS da planilha
  OBJECTIVE_ADJUSTMENTS: {
    manutencao: 0,
    emagrecimento: -500,
    hipertrofia: 400
  } as const,

  // Proteína por perfil (g/kg) - EXATOS da planilha
  PROTEIN_RATIOS: {
    eutrofico: 1.8,
    obeso_sobrepeso: 2.0,
    atleta: 2.2
  } as const,

  // Percentual de Gordura padrão - EXATO da planilha
  FAT_PERCENTAGE: 0.25, // 25% do GET

  // Mínimo calórico para emagrecimento - EXATO da planilha
  MIN_CALORIES_WEIGHT_LOSS: 1200,

  // Conversões calóricas - EXATAS da planilha
  CALORIC_VALUES: {
    protein: 4, // kcal/g
    carbs: 4,   // kcal/g
    fat: 9      // kcal/g
  } as const,

  // Distribuição por refeição - EXATA da planilha
  MEAL_DISTRIBUTION: {
    cafe_manha: 0.25,    // 25%
    lanche_manha: 0.10,  // 10%
    almoco: 0.30,        // 30%
    lanche_tarde: 0.10,  // 10%
    jantar: 0.20,        // 20%
    ceia: 0.05           // 5%
  } as const
};

export interface CalculationInputs {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  profile: ProfileType;
  activityLevel: ActivityLevel;
  objective: ObjectiveType;
}

export interface TMBResult {
  value: number;
  formula: 'harris_benedict' | 'mifflin_st_jeor';
  details: string;
}

export interface MacroResult {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
}

export interface CompleteNutritionalResult {
  tmb: TMBResult;
  gea: number;
  get: number;
  macros: MacroResult;
  mealDistribution: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  formulaUsed: string;
  profileUsed: ProfileType;
}

/**
 * FÓRMULA HARRIS-BENEDICT - EXATA DA PLANILHA
 * Usada para: Eutrófico e Atleta
 */
export function calculateTMB_HarrisBenedict(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  if (gender === 'M') {
    // Homens: TMB = 66.5 + (13.75 × Peso) + (5.003 × Altura) - (6.75 × Idade)
    return 66.5 + (13.75 * weight) + (5.003 * height) - (6.75 * age);
  } else {
    // Mulheres: TMB = 655.1 + (9.563 × Peso) + (1.850 × Altura) - (4.676 × Idade)
    return 655.1 + (9.563 * weight) + (1.850 * height) - (4.676 * age);
  }
}

/**
 * FÓRMULA MIFFLIN-ST JEOR - EXATA DA PLANILHA  
 * Usada para: Obeso/Sobrepeso
 */
export function calculateTMB_MifflinStJeor(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  if (gender === 'M') {
    // Homens: TMB = (10 × Peso) + (6.25 × Altura) - (5 × Idade) + 5
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    // Mulheres: TMB = (10 × Peso) + (6.25 × Altura) - (5 × Idade) - 161
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

/**
 * SELEÇÃO AUTOMÁTICA DE FÓRMULA TMB - EXATA DA PLANILHA
 */
export function calculateTMB(
  weight: number,
  height: number, 
  age: number,
  gender: Gender,
  profile: ProfileType
): TMBResult {
  let value: number;
  let formula: 'harris_benedict' | 'mifflin_st_jeor';

  // Seleção automática conforme planilha
  if (profile === 'obeso_sobrepeso') {
    value = calculateTMB_MifflinStJeor(weight, height, age, gender);
    formula = 'mifflin_st_jeor';
  } else {
    // Eutrófico e Atleta usam Harris-Benedict
    value = calculateTMB_HarrisBenedict(weight, height, age, gender);
    formula = 'harris_benedict';
  }

  return {
    value: Math.round(value),
    formula,
    details: `${formula === 'harris_benedict' ? 'Harris-Benedict' : 'Mifflin-St Jeor'} para perfil ${profile}`
  };
}

/**
 * CÁLCULO GEA (Gasto Energético de Atividade) - EXATO DA PLANILHA
 */
export function calculateGEA(tmb: number, activityLevel: ActivityLevel): number {
  const factor = PLANILHA_CONSTANTS.ACTIVITY_FACTORS[activityLevel];
  return Math.round(tmb * factor);
}

/**
 * CÁLCULO GET (Gasto Energético Total) - EXATO DA PLANILHA
 */
export function calculateGET(gea: number, objective: ObjectiveType): number {
  const adjustment = PLANILHA_CONSTANTS.OBJECTIVE_ADJUSTMENTS[objective];
  let get = gea + adjustment;
  
  // Aplicar mínimo de 1200 kcal para emagrecimento - CONFORME PLANILHA
  if (objective === 'emagrecimento' && get < PLANILHA_CONSTANTS.MIN_CALORIES_WEIGHT_LOSS) {
    get = PLANILHA_CONSTANTS.MIN_CALORIES_WEIGHT_LOSS;
  }
  
  return Math.round(get);
}

/**
 * CÁLCULO DE MACRONUTRIENTES - EXATO DA PLANILHA
 * Implementa o cálculo por diferença conforme especificado
 */
export function calculateMacronutrients(
  get: number,
  weight: number,
  profile: ProfileType
): MacroResult {
  // 1. Proteína em g/kg - EXATA DA PLANILHA
  const proteinRatio = PLANILHA_CONSTANTS.PROTEIN_RATIOS[profile];
  const proteinGrams = proteinRatio * weight;
  const proteinKcal = proteinGrams * PLANILHA_CONSTANTS.CALORIC_VALUES.protein;

  // 2. Gordura 25% do GET - EXATA DA PLANILHA
  const fatKcal = get * PLANILHA_CONSTANTS.FAT_PERCENTAGE;
  const fatGrams = fatKcal / PLANILHA_CONSTANTS.CALORIC_VALUES.fat;

  // 3. Carboidrato por diferença - EXATO DA PLANILHA
  const carbsKcal = get - proteinKcal - fatKcal;
  const carbsGrams = Math.max(0, carbsKcal / PLANILHA_CONSTANTS.CALORIC_VALUES.carbs);

  // Calcular percentuais
  const proteinPercentage = (proteinKcal / get) * 100;
  const fatPercentage = (fatKcal / get) * 100;
  const carbsPercentage = (carbsKcal / get) * 100;

  return {
    protein: {
      grams: Math.round(proteinGrams * 10) / 10,
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercentage * 10) / 10
    },
    carbs: {
      grams: Math.round(carbsGrams * 10) / 10,
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercentage * 10) / 10
    },
    fat: {
      grams: Math.round(fatGrams * 10) / 10,
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercentage * 10) / 10
    }
  };
}

/**
 * DISTRIBUIÇÃO POR REFEIÇÃO - EXATA DA PLANILHA
 */
export function calculateMealDistribution(macros: MacroResult, get: number) {
  const distribution: Record<string, any> = {};
  
  Object.entries(PLANILHA_CONSTANTS.MEAL_DISTRIBUTION).forEach(([meal, percentage]) => {
    distribution[meal] = {
      calories: Math.round(get * percentage),
      protein: Math.round(macros.protein.grams * percentage * 10) / 10,
      carbs: Math.round(macros.carbs.grams * percentage * 10) / 10,
      fat: Math.round(macros.fat.grams * percentage * 10) / 10
    };
  });

  return distribution;
}

/**
 * MOTOR NUTRICIONAL COMPLETO - FIEL À PLANILHA
 * Esta é a função principal que deve ser usada para todos os cálculos
 */
export function calculateCompleteNutrition(inputs: CalculationInputs): CompleteNutritionalResult {
  // Validações
  if (inputs.weight <= 0 || inputs.height <= 0 || inputs.age <= 0) {
    throw new Error('Peso, altura e idade devem ser maiores que zero');
  }

  // 1. Calcular TMB com seleção automática de fórmula
  const tmb = calculateTMB(
    inputs.weight,
    inputs.height,
    inputs.age,
    inputs.gender,
    inputs.profile
  );

  // 2. Calcular GEA
  const gea = calculateGEA(tmb.value, inputs.activityLevel);

  // 3. Calcular GET com ajuste por objetivo
  const get = calculateGET(gea, inputs.objective);

  // 4. Calcular macronutrientes
  const macros = calculateMacronutrients(get, inputs.weight, inputs.profile);

  // 5. Distribuir por refeições
  const mealDistribution = calculateMealDistribution(macros, get);

  return {
    tmb,
    gea,
    get,
    macros,
    mealDistribution,
    formulaUsed: `${tmb.formula} (${inputs.profile})`,
    profileUsed: inputs.profile
  };
}

/**
 * VALIDAÇÃO DE PARÂMETROS DE ENTRADA
 */
export function validateInputs(inputs: CalculationInputs): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (inputs.weight <= 0 || inputs.weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }

  if (inputs.height <= 0 || inputs.height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }

  if (inputs.age <= 0 || inputs.age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  const validProfiles: ProfileType[] = ['eutrofico', 'obeso_sobrepeso', 'atleta'];
  if (!validProfiles.includes(inputs.profile)) {
    errors.push('Perfil deve ser: eutrofico, obeso_sobrepeso ou atleta');
  }

  const validActivityLevels: ActivityLevel[] = ['sedentario', 'leve', 'moderado', 'muito_ativo', 'extremamente_ativo'];
  if (!validActivityLevels.includes(inputs.activityLevel)) {
    errors.push('Nível de atividade inválido');
  }

  const validObjectives: ObjectiveType[] = ['manutencao', 'emagrecimento', 'hipertrofia'];
  if (!validObjectives.includes(inputs.objective)) {
    errors.push('Objetivo deve ser: manutencao, emagrecimento ou hipertrofia');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
