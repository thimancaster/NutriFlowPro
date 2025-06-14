/**
 * Mapeamento de Compatibilidade entre Sistema Legado e ENP
 * Permite transição gradual e compatibilidade com código existente
 */

import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { ENPInputs, calculateCompleteENP } from './enpCalculations';
import { GERFormula } from '@/types/gerFormulas';

/**
 * Mapeia Profile do sistema atual para objetivos ENP
 */
export function mapProfileToENPObjective(profile: Profile, currentObjective?: string): 'manter_peso' | 'perder_peso' | 'ganhar_peso' {
  // Para perfis específicos, pode haver objetivos padrão
  switch (profile) {
    case 'eutrofico':
      return (currentObjective as 'manter_peso' | 'perder_peso' | 'ganhar_peso') || 'manter_peso';
    case 'sobrepeso_obesidade':
      return (currentObjective as 'manter_peso' | 'perder_peso' | 'ganhar_peso') || 'perder_peso';
    case 'atleta':
      return (currentObjective as 'manter_peso' | 'perder_peso' | 'ganhar_peso') || 'ganhar_peso';
    default:
      return 'manter_peso';
  }
}

/**
 * Mapeia ActivityLevel atual para ENP
 */
export function mapActivityLevelToENP(activityLevel: ActivityLevel): 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo' {
  const mapping: Record<ActivityLevel, 'sedentario' | 'leve' | 'moderado' | 'muito_ativo' | 'extremamente_ativo'> = {
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
export function mapObjectiveToENP(objective: Objective): 'manter_peso' | 'perder_peso' | 'ganhar_peso' {
  const mapping: Record<Objective, 'manter_peso' | 'perder_peso' | 'ganhar_peso'> = {
    emagrecimento: 'perder_peso',
    manutenção: 'manter_peso',
    hipertrofia: 'ganhar_peso',
    personalizado: 'manter_peso'
  };
  
  return mapping[objective] || 'manter_peso';
}

/**
 * Mapeia perfil atual para formato compatível com sistema legado
 */
export function mapToLegacyProfile(profile: Profile): 'magro' | 'obeso' | 'atleta' {
  switch (profile) {
    case 'eutrofico':
      return 'magro';
    case 'sobrepeso_obesidade':
      return 'obeso';
    case 'atleta':
      return 'atleta';
    default:
      return 'magro';
  }
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
  profile?: Profile,
  gerFormula: GERFormula = 'harris_benedict_revisada'
) {
  const enpInputs: ENPInputs = {
    weight,
    height,
    age,
    sex,
    activityLevel: mapActivityLevelToENP(activityLevel as ActivityLevel),
    objective: mapObjectiveToENP(objective as Objective),
    gerFormula
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
