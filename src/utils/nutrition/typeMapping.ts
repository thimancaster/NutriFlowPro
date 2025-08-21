
/**
 * Mapeamento de tipos entre sistema legado e novo motor centralizado
 */

import { 
  ProfileType as NewProfileType,
  ActivityLevel as NewActivityLevel,
  ObjectiveType as NewObjectiveType,
  Gender as NewGender
} from '@/utils/nutrition/centralMotor/enpCore';

import { 
  Profile as LegacyProfile,
  ActivityLevel as LegacyActivityLevel,
  Objective as LegacyObjective,
  Sex as LegacySex
} from '@/types/consultation';

// Mapeamento de perfis
export const mapProfileToNew = (profile: LegacyProfile): NewProfileType => {
  switch (profile) {
    case 'sobrepeso_obesidade':
      return 'obeso_sobrepeso';
    case 'eutrofico':
      return 'eutrofico';
    case 'atleta':
      return 'atleta';
    default:
      return 'eutrofico';
  }
};

export const mapProfileToLegacy = (profile: NewProfileType): LegacyProfile => {
  switch (profile) {
    case 'obeso_sobrepeso':
      return 'sobrepeso_obesidade';
    case 'eutrofico':
      return 'eutrofico';
    case 'atleta':
      return 'atleta';
    default:
      return 'eutrofico';
  }
};

// Mapeamento de níveis de atividade
export const mapActivityLevelToNew = (activityLevel: LegacyActivityLevel): NewActivityLevel => {
  switch (activityLevel) {
    case 'sedentario':
      return 'sedentario';
    case 'leve':
      return 'leve';
    case 'moderado':
      return 'moderado';
    case 'intenso':
      return 'muito_ativo';
    case 'muito_intenso':
      return 'extremamente_ativo';
    default:
      return 'moderado';
  }
};

export const mapActivityLevelToLegacy = (activityLevel: NewActivityLevel): LegacyActivityLevel => {
  switch (activityLevel) {
    case 'sedentario':
      return 'sedentario';
    case 'leve':
      return 'leve';
    case 'moderado':
      return 'moderado';
    case 'muito_ativo':
      return 'intenso';
    case 'extremamente_ativo':
      return 'muito_intenso';
    default:
      return 'moderado';
  }
};

// Mapeamento de objetivos
export const mapObjectiveToNew = (objective: LegacyObjective): NewObjectiveType => {
  switch (objective) {
    case 'manutenção':
      return 'manutencao';
    case 'emagrecimento':
      return 'emagrecimento';
    case 'hipertrofia':
      return 'hipertrofia';
    case 'personalizado':
      return 'manutencao'; // Default para personalizado
    default:
      return 'manutencao';
  }
};

export const mapObjectiveToLegacy = (objective: NewObjectiveType): LegacyObjective => {
  switch (objective) {
    case 'manutencao':
      return 'manutenção';
    case 'emagrecimento':
      return 'emagrecimento';
    case 'hipertrofia':
      return 'hipertrofia';
    default:
      return 'manutenção';
  }
};

// Mapeamento de gênero
export const mapGenderToNew = (gender: LegacySex): NewGender => {
  return gender;
};

export const mapGenderToLegacy = (gender: NewGender): LegacySex => {
  return gender;
};
