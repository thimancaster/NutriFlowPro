/**
 * Engenharia Nutricional Padrão (ENP) - Cálculos Padronizados
 * Implementação completa baseada no documento ENP oficial
 */
import { GERFormula, GER_FORMULAS } from "@/types/gerFormulas";
import { calculateGER } from "./gerCalculations";

export interface ENPInputs {
  weight: number;  // kg
  height: number;  // cm
  age: number;     // anos
  sex: 'M' | 'F';
  activityLevel: 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo';
  objective: 'manter_peso' | 'perder_peso' | 'ganhar_peso';
  gerFormula: GERFormula;
  bodyFatPercentage?: number;
}

export interface ENPResults {
  tmb: number; // Represents GER
  gea: number;  // Gasto Energético em Atividade (TMB * FA)
  get: number;  // Gasto Energético Total (com ajuste de objetivo)
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fat: { grams: number; kcal: number; percentage: number };
    proteinPerKg: number;
  };
  gerFormulaName: string;
}

/**
 * Fórmula Harris-Benedict Revisada - ÚNICA FÓRMULA ENP
 * Seção 3.1 da ENP
 * @deprecated Use calculateGER from gerCalculations.ts instead. Kept for reference.
 */
export function calculateTMB_ENP(weight: number, height: number, age: number, sex: 'M' | 'F'): number {
  if (sex === 'M') {
    // Harris-Benedict Revisada (Roza & Shizgal, 1984)
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    // Harris-Benedict Revisada (Roza & Shizgal, 1984)
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

/**
 * Fatores de Atividade Física Padrão ENP
 * Seção 3.2 da ENP
 */
const ACTIVITY_FACTORS_ENP: Record<string, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  muito_ativo: 1.725,
  extremamente_ativo: 1.9
};

/**
 * Calcula Gasto Energético em Atividade (GEA = TMB * FA)
 * Seção 3.2 da ENP
 */
export function calculateGEA_ENP(tmb: number, activityLevel: string): number {
  const factor = ACTIVITY_FACTORS_ENP[activityLevel] || 1.2;
  return Math.round(tmb * factor);
}

/**
 * Aplica Fator Objetivo para calcular GET final
 * Seção 3.3 da ENP
 */
export function calculateGET_ENP(gea: number, objective: string, tmb: number): number {
  let get: number;
  
  switch (objective) {
    case 'manter_peso':
      get = gea;
      break;
    case 'perder_peso':
      get = gea - 500; // Déficit de 500 kcal
      // Garantir que não seja inferior à TMB ou 1200 kcal (mínimo seguro)
      const minimumSafe = Math.max(tmb, 1200);
      get = Math.max(get, minimumSafe);
      break;
    case 'ganhar_peso':
      get = gea + 400; // Superávit de 400 kcal
      break;
    default:
      get = gea;
  }
  
  return Math.round(get);
}

/**
 * Calcula distribuição de macronutrientes segundo padrões ENP
 * Seção 4 da ENP
 */
export function calculateMacros_ENP(get: number, weight: number): {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
  proteinPerKg: number;
} {
  // Padrões ENP Seção 4.1
  const proteinPerKg = 1.8; // g/kg
  const fatPercentage = 0.25; // 25% do GET
  
  // Cálculo sequencial conforme ENP Seção 4.2
  
  // 1. Gramas de Proteína e Kcal de Proteína
  const proteinGrams = Math.round(proteinPerKg * weight);
  const proteinKcal = proteinGrams * 4;
  
  // 2. Kcal de Gordura e Gramas de Gordura
  const fatKcal = Math.round(get * fatPercentage);
  const fatGrams = Math.round(fatKcal / 9);
  
  // 3. Kcal de Carboidrato (por diferença) e Gramas de Carboidrato
  const carbsKcal = get - proteinKcal - fatKcal;
  const carbsGrams = Math.round(carbsKcal / 4);
  
  return {
    protein: {
      grams: proteinGrams,
      kcal: proteinKcal,
      percentage: Math.round((proteinKcal / get) * 100)
    },
    carbs: {
      grams: carbsGrams,
      kcal: carbsKcal,
      percentage: Math.round((carbsKcal / get) * 100)
    },
    fat: {
      grams: fatGrams,
      kcal: fatKcal,
      percentage: Math.round((fatKcal / get) * 100)
    },
    proteinPerKg
  };
}

/**
 * Função principal de cálculo ENP completo
 */
export function calculateCompleteENP(inputs: ENPInputs): ENPResults {
  // Validação de entrada
  if (inputs.weight <= 0 || inputs.height <= 0 || inputs.age <= 0) {
    throw new Error('Valores de peso, altura e idade devem ser maiores que zero');
  }
  if (!inputs.gerFormula) {
    throw new Error('É obrigatório selecionar uma fórmula GER.');
  }
  
  // Cálculo GER (TMB) com a fórmula selecionada
  const { ger: tmb, formulaName } = calculateGER(inputs.gerFormula, {
    weight: inputs.weight,
    height: inputs.height,
    age: inputs.age,
    sex: inputs.sex,
    bodyFatPercentage: inputs.bodyFatPercentage
  });
  
  // Cálculo GEA (TMB * Fator Atividade)
  const gea = calculateGEA_ENP(tmb, inputs.activityLevel);
  
  // Cálculo GET (GEA + Ajuste Objetivo)
  const get = calculateGET_ENP(gea, inputs.objective, tmb);
  
  // Cálculo Macros
  const macros = calculateMacros_ENP(get, inputs.weight);
  
  return {
    tmb: Math.round(tmb),
    gea,
    get,
    macros,
    gerFormulaName: formulaName
  };
}

/**
 * Validação de parâmetros de entrada ENP
 */
export function validateENPInputs(inputs: ENPInputs): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!inputs.weight || inputs.weight <= 0 || inputs.weight > 500) {
    errors.push('Peso deve estar entre 1 e 500 kg');
  }
  
  if (!inputs.height || inputs.height <= 0 || inputs.height > 250) {
    errors.push('Altura deve estar entre 1 e 250 cm');
  }
  
  if (!inputs.age || inputs.age <= 0 || inputs.age > 120) {
    errors.push('Idade deve estar entre 1 e 120 anos');
  }

  if (!inputs.sex || !['M', 'F'].includes(inputs.sex)) {
    errors.push('Sexo deve ser informado (Masculino/Feminino)');
  }
  
  if (!inputs.activityLevel) {
    errors.push('Nível de atividade física deve ser selecionado');
  }
  
  if (!inputs.objective) {
    errors.push('Objetivo deve ser selecionado');
  }

  if (!inputs.gerFormula) {
    errors.push('A seleção da equação GER é obrigatória.');
  } else {
    const formulaInfo = GER_FORMULAS[inputs.gerFormula];
    if (formulaInfo.requiresBodyFat && (inputs.bodyFatPercentage === undefined || inputs.bodyFatPercentage <= 0)) {
        errors.push(`A fórmula ${formulaInfo.name} requer um valor válido para percentual de gordura corporal.`);
    }
  }

  // Warnings
  if (inputs.age && inputs.age < 18) {
    warnings.push('Cálculos ENP são validados para adultos (≥18 anos)');
  }
    
  if (inputs.weight && inputs.height) {
    const imc = inputs.weight / Math.pow(inputs.height / 100, 2);
    if (imc > 0 && (imc < 16 || imc > 40)) {
      warnings.push('IMC fora da faixa usual - considere avaliação médica');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
