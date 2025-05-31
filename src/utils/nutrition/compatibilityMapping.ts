
/**
 * Mapeamento de Compatibilidade entre Sistema Legado e ENP
 * Permite transição gradual e compatibilidade com código existente
 */

import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { ENPInputs, calculateCompleteENP } from './enpCalculations';

/**
 * Mapeia Profile do sistema atual para objetivos ENP
 */
export function mapProfileToENPObjective(profile: Profile, currentObjective?: string): string {
  // Para perfis específicos, pode haver objetivos padrão
  switch (profile) {
    case 'eutrofico':
      return currentObjective || 'manter_peso';
    case 'sobrepeso_obesidade':
      return currentObjective || 'perder_peso';
    case 'atleta':
      return currentObjective || 'ganhar_peso';
    default:
      return 'manter_peso';
  }
}

/**
 * Mapeia ActivityLevel atual para ENP
 */
export function mapActivityLevelToENP(activityLevel: ActivityLevel): string {
  const mapping: Record<ActivityLevel, string> = {
    sedentario: 'sedentario',
    leve: 'leve',
    moderado: 'moderado',
    intenso: 'muito_ativo',
    muito_intenso: 'extremamente_ativo'
  };
  
  return mapping[activityLevel] || 'sedentario';
}

/**
 * Mapeia Objective atual para ENP
 */
export function mapObjectiveToENP(objective: Objective): string {
  const mapping: Record<Objective, string> = {
    emagrecimento: 'perder_peso',
    manutenção: 'manter_peso',
    hipertrofia: 'ganhar_peso',
    personalizado: 'manter_peso'
  };
  
  return mapping[objective] || 'manter_peso';
}

/**
 * Função adaptadora que permite usar ENP com tipos do sistema atual
 */
export function calculateWithENPCompatibility(
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel | string,
  objective: Objective | string,
  profile?: Profile
) {
  const enpInputs: ENPInputs = {
    weight,
    height,
    age,
    sex,
    activityLevel: typeof activityLevel === 'string' ? 
      mapActivityLevelToENP(activityLevel as ActivityLevel) : 
      mapActivityLevelToENP(activityLevel),
    objective: typeof objective === 'string' ? 
      mapObjectiveToENP(objective as Objective) : 
      mapObjectiveToENP(objective)
  };
  
  return calculateCompleteENP(enpInputs);
}

/**
 * Wrapper para manter compatibilidade com calculateMacros existente
 */
export function calculateMacrosENPWrapper(
  vet: number,
  weight: number,
  objective: Objective | string,
  profile: Profile | string
) {
  // Para manter compatibilidade, assumimos que o VET já foi calculado
  // e apenas calculamos os macros baseados no padrão ENP
  const proteinPerKg = 1.8;
  const fatPercentage = 0.25;
  
  const proteinGrams = Math.round(proteinPerKg * weight);
  const proteinKcal = proteinGrams * 4;
  
  const fatKcal = Math.round(vet * fatPercentage);
  const fatGrams = Math.round(fatKcal / 9);
  
  const carbsKcal = vet - proteinKcal - fatKcal;
  const carbsGrams = Math.round(carbsKcal / 4);
  
  return {
    protein: {
      grams: proteinGrams,
      kcal: proteinKcal,
      percentage: Math.round((proteinKcal / vet) * 100)
    },
    carbs: {
      grams: carbsGrams,
      kcal: carbsKcal,
      percentage: Math.round((carbsKcal / vet) * 100)
    },
    fat: {
      grams: fatGrams,
      kcal: fatKcal,
      percentage: Math.round((fatKcal / vet) * 100)
    },
    proteinPerKg
  };
}
