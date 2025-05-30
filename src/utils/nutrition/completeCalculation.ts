
/**
 * Complete Nutrition Calculation
 * Orquestra todos os cálculos nutricionais usando as fórmulas específicas
 */

import { calculateTMB, TMBResult } from './tmbCalculations';
import { calculateVET, VETResult } from './vetCalculations';
import { calculateMacros, MacroResult } from './macroCalculations';
import { ActivityLevel, Objective } from '@/types/consultation';

export interface CompleteNutritionResult {
  tmb: number;
  get: number;
  vet: number;
  adjustment: number;
  macros: MacroResult;
  formula: string;
  recommendations: string[];
  calculations: {
    tmb: TMBResult;
    vet: VETResult;
    macros: MacroResult;
  };
}

/**
 * Executa cálculo nutricional completo com fórmulas específicas por perfil
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
  
  // 1. Calcular TMB com fórmula específica para o perfil
  const tmbResult = calculateTMB(weight, height, age, sex, profile);
  
  // 2. Calcular VET considerando perfil de atleta
  const vetResult = calculateVET(tmbResult.tmb, activityLevel, objective, profile);
  
  // 3. Calcular macronutrientes
  const macroResult = calculateMacros(
    vetResult.vet,
    weight,
    objective,
    profile,
    customMacroPercentages
  );
  
  // 4. Gerar recomendações específicas
  const recommendations = generateRecommendations(
    profile,
    objective,
    activityLevel,
    vetResult.vet,
    weight
  );
  
  return {
    tmb: tmbResult.tmb,
    get: vetResult.get,
    vet: vetResult.vet,
    adjustment: vetResult.adjustment,
    macros: macroResult,
    formula: tmbResult.formula,
    recommendations,
    calculations: {
      tmb: tmbResult,
      vet: vetResult,
      macros: macroResult
    }
  };
}

/**
 * Gera recomendações específicas baseadas no perfil e objetivos
 */
function generateRecommendations(
  profile: 'magro' | 'obeso' | 'atleta',
  objective: Objective,
  activityLevel: ActivityLevel,
  vet: number,
  weight: number
): string[] {
  const recommendations: string[] = [];
  
  // Recomendações por perfil
  switch (profile) {
    case 'atleta':
      recommendations.push('Fórmula otimizada para atletas de alta performance');
      recommendations.push('Monitorar composição corporal regularmente');
      if (objective === 'emagrecimento') {
        recommendations.push('Evitar déficits calóricos muito agressivos para preservar massa magra');
      }
      if (activityLevel === 'muito_intenso') {
        recommendations.push('Considerar timing nutricional específico para treinos');
      }
      break;
      
    case 'obeso':
      recommendations.push('Fórmula Mifflin-St Jeor - mais precisa para sobrepeso/obesidade');
      recommendations.push('Foco na mudança gradual de hábitos alimentares');
      if (objective === 'emagrecimento') {
        recommendations.push('Priorizar alimentos de alta saciedade e baixa densidade calórica');
      }
      break;
      
    case 'magro':
      recommendations.push('Fórmula Harris-Benedict Revisada - adequada para peso normal');
      if (objective === 'hipertrofia') {
        recommendations.push('Aumentar gradualmente a ingestão calórica');
        recommendations.push('Priorizar proteínas de alto valor biológico');
      }
      break;
  }
  
  // Recomendações por objetivo
  if (objective === 'manutenção') {
    recommendations.push('Manter consistência na alimentação e atividade física');
  }
  
  // Recomendações por atividade
  if (activityLevel === 'sedentario') {
    recommendations.push('Considerar incluir atividade física regular');
  }
  
  return recommendations;
}

/**
 * Valida todos os parâmetros de entrada
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
  
  // Validações básicas
  if (weight <= 0 || weight > 500) errors.push('Peso inválido');
  if (height <= 0 || height > 250) errors.push('Altura inválida');
  if (age <= 0 || age > 120) errors.push('Idade inválida');
  if (!['M', 'F'].includes(sex)) errors.push('Sexo inválido');
  if (!['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'].includes(activityLevel)) {
    errors.push('Nível de atividade inválido');
  }
  if (!['emagrecimento', 'manutenção', 'hipertrofia'].includes(objective)) {
    errors.push('Objetivo inválido');
  }
  if (!['magro', 'obeso', 'atleta'].includes(profile)) {
    errors.push('Perfil inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
