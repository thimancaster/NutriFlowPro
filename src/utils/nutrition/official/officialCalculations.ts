/**
 * MOTOR DE CÁLCULO NUTRICIONAL OFICIAL - FONTE ÚNICA DA VERDADE
 *
 * Este é o único arquivo que contém a lógica de cálculo nutricional validada.
 * Garante 100% de consistência e conformidade em todo o sistema.
 */

// Tipos essenciais para os cálculos
export type Gender = 'M' | 'F';
export type PatientProfile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
export type ActivityLevel = 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
export type Objective = 'emagrecimento' | 'manutenção' | 'hipertrofia' | 'personalizado';

// --- CONSTANTES FUNDAMENTAIS (Ground Truth) ---

/**
 * Metadados das Fórmulas de TMB para a Interface do Usuário.
 * Esta lista alimenta o seletor no formulário da calculadora.
 */
export const AVAILABLE_FORMULAS = [
  {
    value: 'harris-benedict',
    label: 'Harris-Benedict',
    description: 'Padrão ouro para pacientes eutróficos.',
  },
  {
    value: 'mifflin-st-jeor',
    label: 'Mifflin-St Jeor',
    description: 'Mais preciso para sobrepeso/obesidade.',
  },
  {
    value: 'tinsley',
    label: 'Tinsley',
    description: 'Específico para atletas com alta massa muscular.',
  },
] as const;

/**
 * Fatores de Atividade Física (FA) oficiais.
 */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  intenso: 1.725,
  muito_intenso: 1.9,
} as const;

/**
 * Valores calóricos oficiais por grama de macronutriente.
 */
export const CALORIC_VALUES = {
  protein: 4, // kcal/g
  carbs: 4,   // kcal/g
  fat: 9,     // kcal/g
} as const;

/**
 * Ajustes calóricos oficiais baseados no objetivo do paciente.
 */
export const OBJECTIVE_ADJUSTMENTS: Record<Exclude<Objective, 'personalizado'>, number> = {
  emagrecimento: -500, // Déficit para perda de peso
  manutenção: 0,      // Sem ajuste para manutenção
  hipertrofia: 400,   // Superávit para hipertrofia
} as const;

// --- IMPLEMENTAÇÃO DAS FÓRMULAS INDIVIDUAIS ---

/**
 * Equação de HARRIS-BENEDICT (Original).
 */
export function calculateTMB_HarrisBenedict(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === 'M') {
    return 66 + 13.7 * weight + 5.0 * height - 6.8 * age;
  } else {
    return 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
  }
}

/**
 * Equação de MIFFLIN-ST JEOR.
 */
export function calculateTMB_MifflinStJeor(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === 'M') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Equação de TINSLEY (para atletas).
 */
export function calculateTMB_Tinsley(weight: number): number {
  return 24.8 * weight + 10;
}

// --- FUNÇÕES PRINCIPAIS DO MOTOR DE CÁLCULO ---

/**
 * Calcula a TMB com base na fórmula selecionada pelo usuário.
 */
export function calculateTMB_Official(
  formula: typeof AVAILABLE_FORMULAS[number]['value'],
  weight: number,
  height: number,
  age: number,
  gender: Gender
): { value: number; formula: string } {
  let tmb: number;
  let formulaLabel: string;

  switch (formula) {
    case 'harris-benedict':
      tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
      formulaLabel = 'Harris-Benedict';
      break;
    case 'mifflin-st-jeor':
      tmb = calculateTMB_MifflinStJeor(weight, height, age, gender);
      formulaLabel = 'Mifflin-St Jeor';
      break;
    case 'tinsley':
      tmb = calculateTMB_Tinsley(weight);
      formulaLabel = 'Tinsley';
      break;
    default:
      // Fallback para Harris-Benedict se a fórmula for inválida
      tmb = calculateTMB_HarrisBenedict(weight, height, age, gender);
      formulaLabel = 'Harris-Benedict (Padrão)';
  }

  return {
    value: Math.round(tmb),
    formula: formulaLabel,
  };
}

/**
 * Calcula o Gasto Energético Total (GET) aplicando o Fator de Atividade.
 */
export function calculateGET_Official(tmb: number, activityLevel: ActivityLevel): number {
  const activityFactor = ACTIVITY_FACTORS[activityLevel];
  return Math.round(tmb * activityFactor);
}

/**
 * Calcula o Valor Energético Total (VET) aplicando o ajuste de objetivo.
 */
export function calculateVET_Official(get: number, objective: Objective): number {
  if (objective === 'personalizado') {
    return get; // Nenhum ajuste para objetivos personalizados
  }

  const adjustment = OBJECTIVE_ADJUSTMENTS[objective as Exclude<Objective, 'personalizado'>];
  const vet = get + adjustment;

  // Trava de segurança para evitar VET abaixo de 1200 kcal em emagrecimento
  if (objective === 'emagrecimento' && vet < 1200) {
    console.warn('VET ajustado para o nível mínimo seguro (1200 kcal)');
    return 1200;
  }

  return Math.round(vet);
}

// --- CÁLCULO DE MACRONUTRIENTES ---

export interface ManualMacroInputs {
  proteinPerKg: number;
  fatPerKg: number;
}

export interface MacroResult {
  protein: { grams: number; kcal: number; percentage: number };
  carbs: { grams: number; kcal: number; percentage: number };
  fat: { grams: number; kcal: number; percentage: number };
}

/**
 * Calcula os macronutrientes com base na entrada de g/kg.
 * Carboidratos são calculados automaticamente pela diferença.
 */
export function calculateMacros_ByGramsPerKg(
  vet: number,
  weight: number,
  macroInputs: ManualMacroInputs
): MacroResult {
  const proteinGrams = macroInputs.proteinPerKg * weight;
  const proteinKcal = proteinGrams * CALORIC_VALUES.protein;

  const fatGrams = macroInputs.fatPerKg * weight;
  const fatKcal = fatGrams * CALORIC_VALUES.fat;

  const carbsKcal = Math.max(0, vet - proteinKcal - fatKcal);
  const carbsGrams = carbsKcal / CALORIC_VALUES.carbs;

  // Prevenção de divisão por zero se VET for 0
  const totalVet = vet > 0 ? vet : 1;
  const proteinPercentage = (proteinKcal / totalVet) * 100;
  const fatPercentage = (fatKcal / totalVet) * 100;
  const carbsPercentage = (carbsKcal / totalVet) * 100;

  return {
    protein: {
      grams: Math.round(proteinGrams * 10) / 10,
      kcal: Math.round(proteinKcal),
      percentage: Math.round(proteinPercentage * 10) / 10,
    },
    carbs: {
      grams: Math.round(carbsGrams * 10) / 10,
      kcal: Math.round(carbsKcal),
      percentage: Math.round(carbsPercentage * 10) / 10,
    },
    fat: {
      grams: Math.round(fatGrams * 10) / 10,
      kcal: Math.round(fatKcal),
      percentage: Math.round(fatPercentage * 10) / 10,
    },
  };
}

// --- PIPELINE COMPLETO DE CÁLCULO ---

export interface CalculationInputs {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  formula: typeof AVAILABLE_FORMULAS[number]['value'];
  activityLevel: ActivityLevel;
  objective: Objective;
  macroInputs: ManualMacroInputs;
}

export interface CalculationResult {
  tmb: { value: number; formula: string };
  get: number;
  vet: number;
  macros: MacroResult;
  proteinPerKg: number;
  fatPerKg: number;
}

/**
 * Executa o fluxo completo de cálculo nutricional.
 */
export function calculateComplete_Official(inputs: CalculationInputs): CalculationResult {
  if (!inputs.weight || !inputs.height || !inputs.age || !inputs.gender || !inputs.formula) {
    throw new Error('Dados antropométricos e fórmula são obrigatórios.');
  }
  if (!inputs.macroInputs || inputs.macroInputs.proteinPerKg <= 0 || inputs.macroInputs.fatPerKg <= 0) {
    throw new Error('Entradas de macronutrientes (g/kg) são obrigatórias e devem ser maiores que zero.');
  }

  // Etapa 1: Calcular TMB
  const tmb = calculateTMB_Official(
    inputs.formula,
    inputs.weight,
    inputs.height,
    inputs.age,
    inputs.gender
  );

  // Etapa 2: Calcular GET
  const get = calculateGET_Official(tmb.value, inputs.activityLevel);

  // Etapa 3: Calcular VET
  const vet = calculateVET_Official(get, inputs.objective);

  // Etapa 4: Calcular Macros
  const macros = calculateMacros_ByGramsPerKg(vet, inputs.weight, inputs.macroInputs);

  return {
    tmb,
    get,
    vet,
    macros,
    proteinPerKg: inputs.macroInputs.proteinPerKg,
    fatPerKg: inputs.macroInputs.fatPerKg,
  };
}
