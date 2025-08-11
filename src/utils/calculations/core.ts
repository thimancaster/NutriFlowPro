
/**
 * Sistema de Cálculos Nutricionais Único - NutriFlow Pro
 * Implementação fiel à planilha de referência
 */

export type Profile = 'eutrofico' | 'sobrepeso_obesidade' | 'atleta';
export type Gender = 'M' | 'F';
export type Objective = 'hipertrofia' | 'emagrecimento' | 'manutencao';

export interface CalculationInputs {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  profile: Profile;
  activityFactor: number;
  objective: Objective;
  calorieAdjustment: number;
  proteinPerKg?: number;
  lipidPerKg?: number;
}

export interface CalculationResults {
  tmb: number;
  get: number;
  vet: number;
  macros: {
    protein: { grams: number; kcal: number; percentage: number };
    carbs: { grams: number; kcal: number; percentage: number };
    fats: { grams: number; kcal: number; percentage: number };
  };
  totalCalories: number;
}

/**
 * Calcula TMB baseado no perfil conforme planilha
 */
export function calculateTMB(profile: Profile, gender: Gender, weight: number, height: number, age: number): number {
  if (!weight || weight <= 0) throw new Error('Peso deve ser maior que zero');
  if (!height || height <= 0) throw new Error('Altura deve ser maior que zero');
  if (!age || age <= 0) throw new Error('Idade deve ser maior que zero');

  switch (profile) {
    case 'eutrofico':
      // Harris-Benedict
      if (gender === 'F') {
        return 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
      } else {
        return 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
      }

    case 'sobrepeso_obesidade':
      // Mifflin-St Jeor
      if (gender === 'F') {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
      } else {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
      }

    case 'atleta':
      // TMB = 22 * peso (conforme planilha)
      return 22 * weight;

    default:
      throw new Error(`Perfil inválido: ${profile}`);
  }
}

/**
 * Calcula GET (TMB * Fator de Atividade)
 */
export function calculateGET(tmb: number, activityFactor: number): number {
  if (!tmb || tmb <= 0) throw new Error('TMB deve ser maior que zero');
  if (!activityFactor || activityFactor <= 0) throw new Error('Fator de atividade deve ser maior que zero');
  
  return tmb * activityFactor;
}

/**
 * Calcula VET (GET ± ajuste calórico)
 */
export function calculateVET(get: number, objective: Objective, calorieAdjustment: number = 0): number {
  if (!get || get <= 0) throw new Error('GET deve ser maior que zero');
  
  switch (objective) {
    case 'hipertrofia':
      return get + Math.abs(calorieAdjustment); // Superávit calórico

    case 'emagrecimento':
      return get - Math.abs(calorieAdjustment); // Déficit calórico

    case 'manutencao':
      return get; // Sem ajuste

    default:
      return get;
  }
}

/**
 * Calcula macronutrientes conforme planilha
 */
export function calculateMacros(vet: number, weight: number, proteinPerKg: number = 1.6, lipidPerKg: number = 0.8) {
  if (!vet || vet <= 0) throw new Error('VET deve ser maior que zero');
  if (!weight || weight <= 0) throw new Error('Peso deve ser maior que zero');

  // Proteína: g/kg * peso
  const proteinGrams = proteinPerKg * weight;
  const proteinKcal = proteinGrams * 4;

  // Lipídio: g/kg * peso
  const lipidGrams = lipidPerKg * weight;
  const lipidKcal = lipidGrams * 9;

  // Carboidrato: por diferença
  const carbsKcal = vet - (proteinKcal + lipidKcal);
  const carbsGrams = Math.max(0, carbsKcal / 4);

  // Validação
  if (carbsKcal < 0) {
    console.warn('Atenção: Proteína + Lipídio excedem o VET. Ajuste os valores.');
  }

  return {
    protein: {
      grams: Math.round(proteinGrams * 100) / 100,
      kcal: Math.round(proteinKcal * 100) / 100,
      percentage: Math.round((proteinKcal / vet) * 10000) / 100
    },
    fats: {
      grams: Math.round(lipidGrams * 100) / 100,
      kcal: Math.round(lipidKcal * 100) / 100,
      percentage: Math.round((lipidKcal / vet) * 10000) / 100
    },
    carbs: {
      grams: Math.round(carbsGrams * 100) / 100,
      kcal: Math.round(carbsKcal * 100) / 100,
      percentage: Math.round((carbsKcal / vet) * 10000) / 100
    }
  };
}

/**
 * Função principal de cálculo completo
 */
export function calculateCompleteNutrition(inputs: CalculationInputs): CalculationResults {
  try {
    const tmb = calculateTMB(inputs.profile, inputs.gender, inputs.weight, inputs.height, inputs.age);
    const get = calculateGET(tmb, inputs.activityFactor);
    const vet = calculateVET(get, inputs.objective, inputs.calorieAdjustment);
    const macros = calculateMacros(vet, inputs.weight, inputs.proteinPerKg, inputs.lipidPerKg);

    return {
      tmb: Math.round(tmb),
      get: Math.round(get),
      vet: Math.round(vet),
      macros: {
        protein: macros.protein,
        carbs: macros.carbs,
        fats: macros.fats
      },
      totalCalories: Math.round(vet)
    };
  } catch (error) {
    console.error('Erro no cálculo nutricional:', error);
    throw error;
  }
}

// Fatores de atividade padrão
export const ACTIVITY_FACTORS = {
  SEDENTARIO: 1.2,
  LEVE: 1.375,
  MODERADO: 1.55,
  INTENSO: 1.725,
  MUITO_INTENSO: 1.9
} as const;

// Valores padrão por perfil
export const DEFAULT_PROTEIN_PER_KG = {
  eutrofico: 1.2,
  sobrepeso_obesidade: 1.6,
  atleta: 2.0
} as const;

export const DEFAULT_LIPID_PER_KG = {
  eutrofico: 0.8,
  sobrepeso_obesidade: 0.6,
  atleta: 1.0
} as const;
