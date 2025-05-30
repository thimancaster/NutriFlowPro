
// DEPRECATED: This file is being phased out in favor of modular structure
// Redirect all exports to the new modular functions

import { 
  calculateMacros as newCalculateMacros,
  mapProfileToCalculation
} from './nutrition/macroCalculations';

import { Profile, Objective } from '@/types/consultation';

interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

interface CalculatedMacros {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

// Legacy wrapper - redirects to new modular function
export const calculateMacrosByProfile = (
  profile: Profile,
  weight: number,
  vet: number,
  objective: Objective = 'manutenção'
): CalculatedMacros => {
  const mappedProfile = mapProfileToCalculation(profile);
  return newCalculateMacros(vet, weight, objective, mappedProfile);
};

// Map old profile values to new ones for backward compatibility
export const mapLegacyProfile = (profile: string): Profile => {
  switch (profile.toLowerCase()) {
    case 'magro':
    case 'normal':
      return 'eutrofico';
    case 'sobrepeso':
    case 'obeso':
      return 'sobrepeso_obesidade';
    case 'atleta':
      return 'atleta';
    case 'eutrofico':
      return 'eutrofico';
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    default:
      return 'eutrofico';
  }
};
