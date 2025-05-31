
/**
 * Complete Nutrition Calculation - Implementação ENP Unificada
 * Integra todos os cálculos conforme Engenharia Nutricional Padrão
 */

import { ActivityLevel, Objective } from '@/types/consultation';
import { calculateTMB, validateTMBParameters } from './tmbCalculations';
import { calculateGET } from './getCalculations';
import { calculateVET } from './vetCalculations';
import { calculateMacros, mapProfileToCalculation } from './macroCalculations';
import { calculateCompleteENP, ENPInputs } from './enpCalculations';

export interface CompleteNutritionResult {
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
  formula: string;
  recommendations?: string;
}

/**
 * Função principal de cálculo nutricional completo usando ENP
 */
export async function calculateCompleteNutrition(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta',
  customMacroPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
  }
): Promise<CompleteNutritionResult> {
  // Usar sistema ENP como preferência
  try {
    const enpInputs: ENPInputs = {
      weight,
      height,
      age,
      sex,
      activityLevel: activityLevel === 'intenso' ? 'muito_ativo' : 
                     activityLevel === 'muito_intenso' ? 'extremamente_ativo' : 
                     activityLevel as any,
      objective: objective === 'emagrecimento' ? 'perder_peso' :
                objective === 'manutenção' ? 'manter_peso' :
                objective === 'hipertrofia' ? 'ganhar_peso' : 'manter_peso'
    };
    
    const enpResults = calculateCompleteENP(enpInputs);
    
    return {
      tmb: enpResults.tmb,
      get: enpResults.gea,
      vet: enpResults.get,
      adjustment: enpResults.get - enpResults.gea,
      macros: {
        protein: enpResults.macros.protein,
        carbs: enpResults.macros.carbs,
        fat: enpResults.macros.fat,
        proteinPerKg: enpResults.macros.proteinPerKg
      },
      formula: 'ENP - Harris-Benedict Revisada',
      recommendations: generateENPRecommendations(enpInputs, enpResults)
    };
  } catch (error) {
    console.warn('Erro no cálculo ENP, usando sistema legado:', error);
    
    // Fallback para sistema legado
    return calculateLegacyNutrition(weight, height, age, sex, activityLevel, objective, profile, customMacroPercentages);
  }
}

/**
 * Sistema de cálculo legado (backup)
 */
function calculateLegacyNutrition(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta',
  customMacroPercentages?: any
): CompleteNutritionResult {
  // Mapear profile para formato atual
  const mappedProfile = profile === 'magro' ? 'eutrofico' : 
                       profile === 'obeso' ? 'sobrepeso_obesidade' : 'atleta';
  
  // Calcular TMB
  const tmbResult = calculateTMB(weight, height, age, sex, mappedProfile);
  
  // Calcular GET
  const get = calculateGET(tmbResult.tmb, activityLevel, mappedProfile);
  
  // Calcular VET
  const vetResult = calculateVET(get, activityLevel, objective, profile);
  
  // Calcular Macros
  const macros = calculateMacros(vetResult.vet, weight, objective, mappedProfile, customMacroPercentages);
  
  return {
    tmb: tmbResult.tmb,
    get,
    vet: vetResult.vet,
    adjustment: vetResult.adjustment,
    macros,
    formula: tmbResult.formula
  };
}

/**
 * Gera recomendações baseadas nos resultados ENP
 */
function generateENPRecommendations(inputs: ENPInputs, results: any): string {
  const recommendations = [];
  
  if (inputs.objective === 'perder_peso') {
    recommendations.push('Deficit calórico de 500 kcal aplicado conforme ENP');
    recommendations.push('Monitore o progresso semanalmente');
  } else if (inputs.objective === 'ganhar_peso') {
    recommendations.push('Superávit calórico de 400 kcal aplicado conforme ENP');
    recommendations.push('Combine com treinamento de força');
  }
  
  recommendations.push(`Proteína: ${results.macros.proteinPerKg}g/kg conforme padrão ENP`);
  recommendations.push('Distribua as refeições ao longo do dia');
  
  return recommendations.join('. ');
}

/**
 * Validação completa de parâmetros
 */
export function validateAllParameters(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: 'magro' | 'obeso' | 'atleta'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar TMB
  const tmbValidation = validateTMBParameters(weight, height, age);
  if (!tmbValidation.isValid) {
    errors.push(...tmbValidation.errors);
  }
  
  // Validar sexo
  if (!['M', 'F'].includes(sex)) {
    errors.push('Sexo deve ser M ou F');
  }
  
  // Validar nível de atividade
  const validActivityLevels = ['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'];
  if (!validActivityLevels.includes(activityLevel)) {
    errors.push('Nível de atividade inválido');
  }
  
  // Validar objetivo
  const validObjectives = ['emagrecimento', 'manutenção', 'hipertrofia', 'personalizado'];
  if (!validObjectives.includes(objective)) {
    errors.push('Objetivo inválido');
  }
  
  // Validar perfil
  const validProfiles = ['magro', 'obeso', 'atleta'];
  if (!validProfiles.includes(profile)) {
    errors.push('Perfil inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
