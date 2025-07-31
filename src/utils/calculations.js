
/**
 * Nutriflow Pro - Core Calculation Engine
 * Single source of truth for all calculations
 * Based on definitive workflow specification
 */

// Profile types for TMB calculation
export const PROFILE_TYPES = {
  EUTROFICO: 'eutrofico', // Harris-Benedict
  SOBREPESO_OBESIDADE: 'sobrepeso_obesidade', // Mifflin-St Jeor
  ATLETA: 'atleta' // Tinsley
};

// Gender types
export const GENDER_TYPES = {
  FEMININO: 'F',
  MASCULINO: 'M'
};

// Objective types
export const OBJECTIVE_TYPES = {
  HIPERTROFIA: 'hipertrofia',
  EMAGRECIMENTO: 'emagrecimento',
  MANUTENCAO: 'manutencao'
};

/**
 * Etapa 1.1: Cálculo da TMB baseado no perfil do usuário
 * @param {string} profile - Tipo de perfil (eutrofico, sobrepeso_obesidade, atleta)
 * @param {number} weight - Peso em kg
 * @param {number} height - Altura em cm
 * @param {number} age - Idade em anos
 * @param {string} gender - Gênero (M ou F)
 * @returns {number} TMB calculada
 */
export function calculateTMB(profile, weight, height, age, gender) {
  if (!weight || weight <= 0) throw new Error('Peso deve ser maior que zero');
  if (!profile) throw new Error('Perfil do usuário é obrigatório');

  switch (profile) {
    case PROFILE_TYPES.EUTROFICO:
      // Harris-Benedict
      if (gender === GENDER_TYPES.FEMININO) {
        return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
      } else {
        return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
      }

    case PROFILE_TYPES.SOBREPESO_OBESIDADE:
      // Mifflin-St Jeor
      if (gender === GENDER_TYPES.FEMININO) {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
      } else {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
      }

    case PROFILE_TYPES.ATLETA:
      // Tinsley (mesma fórmula para ambos os gêneros)
      return 22 * weight;

    default:
      throw new Error(`Perfil inválido: ${profile}`);
  }
}

/**
 * Etapa 1.2: Cálculo do Gasto Energético Total (GET)
 * @param {number} tmb - Taxa Metabólica Basal
 * @param {number} activityFactor - Fator de atividade (ex: 1.5, 1.6)
 * @returns {number} GET calculado
 */
export function calculateGET(tmb, activityFactor) {
  if (!tmb || tmb <= 0) throw new Error('TMB deve ser maior que zero');
  if (!activityFactor || activityFactor <= 0) throw new Error('Fator de atividade deve ser maior que zero');
  
  return tmb * activityFactor;
}

/**
 * Etapa 1.3: Cálculo do Valor Energético Total (VET) - Meta Final
 * CRÍTICO: Usa valores calóricos brutos, não percentuais
 * @param {number} get - Gasto Energético Total
 * @param {string} objectiveType - Tipo de objetivo (hipertrofia, emagrecimento, manutencao)
 * @param {number} calorieAdjustment - Ajuste calórico em valor bruto (ex: 500 para superávit, 400 para déficit)
 * @returns {number} VET calculado
 */
export function calculateVET(get, objectiveType, calorieAdjustment = 0) {
  if (!get || get <= 0) throw new Error('GET deve ser maior que zero');
  
  switch (objectiveType) {
    case OBJECTIVE_TYPES.HIPERTROFIA:
      return get + Math.abs(calorieAdjustment); // Superávit calórico

    case OBJECTIVE_TYPES.EMAGRECIMENTO:
      return get - Math.abs(calorieAdjustment); // Déficit calórico

    case OBJECTIVE_TYPES.MANUTENCAO:
      return get; // Sem ajuste

    default:
      return get;
  }
}

/**
 * Etapa 2.1: Cálculo dos Gramas Totais de Macronutrientes
 * @param {number} vet - Valor Energético Total
 * @param {number} weight - Peso em kg
 * @param {number} proteinPerKg - Gramas de proteína por kg (ex: 1.8)
 * @param {number} lipidPerKg - Gramas de lipídio por kg (ex: 0.8)
 * @returns {object} Macronutrientes calculados
 */
export function calculateMacros(vet, weight, proteinPerKg, lipidPerKg) {
  if (!vet || vet <= 0) throw new Error('VET deve ser maior que zero');
  if (!weight || weight <= 0) throw new Error('Peso deve ser maior que zero');
  if (proteinPerKg < 0) throw new Error('Proteína por kg deve ser não-negativo');
  if (lipidPerKg < 0) throw new Error('Lipídio por kg deve ser não-negativo');

  // Cálculos automáticos e dependentes
  const meta_g_ptn = proteinPerKg * weight;
  const meta_g_lip = lipidPerKg * weight;
  
  const kcal_ptn = meta_g_ptn * 4;
  const kcal_lip = meta_g_lip * 9;
  const kcal_cho = vet - (kcal_ptn + kcal_lip);
  const meta_g_cho = Math.max(0, kcal_cho / 4); // Garantir que não seja negativo

  // Validação: verificar se sobram calorias suficientes para carboidratos
  if (kcal_cho < 0) {
    console.warn('Atenção: Proteína + Lipídio excedem o VET. Ajuste os valores.');
  }

  return {
    protein: {
      grams: Math.round(meta_g_ptn * 100) / 100,
      kcal: Math.round(kcal_ptn * 100) / 100,
      percentage: Math.round((kcal_ptn / vet) * 10000) / 100
    },
    lipid: {
      grams: Math.round(meta_g_lip * 100) / 100,
      kcal: Math.round(kcal_lip * 100) / 100,
      percentage: Math.round((kcal_lip / vet) * 10000) / 100
    },
    carbohydrate: {
      grams: Math.round(meta_g_cho * 100) / 100,
      kcal: Math.round(kcal_cho * 100) / 100,
      percentage: Math.round((kcal_cho / vet) * 10000) / 100
    },
    total: {
      kcal: vet,
      percentage: 100
    }
  };
}

/**
 * Etapa 2.2: Divisão Percentual por Refeição
 * @param {object} macros - Macronutrientes totais calculados
 * @param {array} mealPercentages - Array com percentuais para cada refeição [20, 20, 20, 20, 20] etc
 * @returns {array} Array com macros distribuídos por refeição
 */
export function distributeMacrosByMeals(macros, mealPercentages) {
  if (!macros) throw new Error('Macros são obrigatórios');
  if (!mealPercentages || mealPercentages.length === 0) throw new Error('Percentuais das refeições são obrigatórios');
  
  // Validação: soma deve ser 100%
  const totalPercentage = mealPercentages.reduce((sum, percentage) => sum + percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.1) {
    throw new Error(`Soma dos percentuais deve ser 100%. Atual: ${totalPercentage}%`);
  }

  return mealPercentages.map((percentage, index) => ({
    mealIndex: index + 1,
    percentage: percentage,
    protein: {
      grams: Math.round((macros.protein.grams * percentage / 100) * 100) / 100,
      kcal: Math.round((macros.protein.kcal * percentage / 100) * 100) / 100
    },
    lipid: {
      grams: Math.round((macros.lipid.grams * percentage / 100) * 100) / 100,
      kcal: Math.round((macros.lipid.kcal * percentage / 100) * 100) / 100
    },
    carbohydrate: {
      grams: Math.round((macros.carbohydrate.grams * percentage / 100) * 100) / 100,
      kcal: Math.round((macros.carbohydrate.kcal * percentage / 100) * 100) / 100
    },
    total: {
      kcal: Math.round((macros.total.kcal * percentage / 100) * 100) / 100
    }
  }));
}

/**
 * Etapa 3: Cálculo de uma Refeição Individual
 * @param {array} foods - Array de alimentos da refeição
 * @returns {object} Totais nutricionais da refeição
 */
export function calculateMealNutrition(foods) {
  if (!foods || foods.length === 0) {
    return {
      protein: { grams: 0, kcal: 0 },
      lipid: { grams: 0, kcal: 0 },
      carbohydrate: { grams: 0, kcal: 0 },
      total: { kcal: 0 }
    };
  }

  return foods.reduce((totals, food) => {
    const portion = food.portion || 1;
    
    const proteinGrams = (food.protein || 0) * portion;
    const lipidGrams = (food.fats || 0) * portion;
    const carbGrams = (food.carbs || 0) * portion;
    const calories = (food.calories || 0) * portion;

    return {
      protein: {
        grams: totals.protein.grams + proteinGrams,
        kcal: totals.protein.kcal + (proteinGrams * 4)
      },
      lipid: {
        grams: totals.lipid.grams + lipidGrams,
        kcal: totals.lipid.kcal + (lipidGrams * 9)
      },
      carbohydrate: {
        grams: totals.carbohydrate.grams + carbGrams,
        kcal: totals.carbohydrate.kcal + (carbGrams * 4)
      },
      total: {
        kcal: totals.total.kcal + calories
      }
    };
  }, {
    protein: { grams: 0, kcal: 0 },
    lipid: { grams: 0, kcal: 0 },
    carbohydrate: { grams: 0, kcal: 0 },
    total: { kcal: 0 }
  });
}

/**
 * Função de validação completa do workflow
 * @param {object} inputs - Todos os inputs do usuário
 * @returns {object} Resultado completo de todos os cálculos
 */
export function calculateCompleteWorkflow(inputs) {
  const {
    // Etapa 1
    profile,
    weight,
    height,
    age,
    gender,
    activityFactor,
    objectiveType,
    calorieAdjustment,
    
    // Etapa 2
    proteinPerKg,
    lipidPerKg,
    mealPercentages
  } = inputs;

  try {
    // Etapa 1: Cálculo Energético
    const tmb = calculateTMB(profile, weight, height, age, gender);
    const get = calculateGET(tmb, activityFactor);
    const vet = calculateVET(get, objectiveType, calorieAdjustment);

    // Etapa 2: Macronutrientes
    const macros = calculateMacros(vet, weight, proteinPerKg, lipidPerKg);
    const mealDistribution = mealPercentages ? distributeMacrosByMeals(macros, mealPercentages) : null;

    return {
      energyCalculation: {
        tmb: Math.round(tmb),
        get: Math.round(get),
        vet: Math.round(vet),
        profile,
        activityFactor,
        calorieAdjustment
      },
      macronutrients: macros,
      mealDistribution: mealDistribution,
      isValid: true,
      errors: []
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [error.message],
      energyCalculation: null,
      macronutrients: null,
      mealDistribution: null
    };
  }
}

// Fatores de atividade comuns
export const ACTIVITY_FACTORS = {
  SEDENTARIO: 1.2,
  LEVE: 1.375,
  MODERADO: 1.55,
  INTENSO: 1.725,
  MUITO_INTENSO: 1.9
};

// Valores padrão recomendados
export const DEFAULT_VALUES = {
  PROTEIN_PER_KG: {
    [PROFILE_TYPES.EUTROFICO]: 1.2,
    [PROFILE_TYPES.SOBREPESO_OBESIDADE]: 1.6,
    [PROFILE_TYPES.ATLETA]: 2.0
  },
  LIPID_PER_KG: {
    [PROFILE_TYPES.EUTROFICO]: 0.8,
    [PROFILE_TYPES.SOBREPESO_OBESIDADE]: 0.6,
    [PROFILE_TYPES.ATLETA]: 1.0
  }
};
