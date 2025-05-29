
import { Profile, ActivityLevel, Objective } from '@/types/consultation';
import { calculateTMB } from './tmbCalculations';
import { calculateGET } from './getCalculations';
import { calculateVET } from './vetCalculations';
import { calculateMacrosByProfile } from './macroCalculations';

/**
 * Função principal de cálculo nutricional completo
 */
export const calculateCompleteNutrition = (
  weight: number,
  height: number,
  age: number,
  sex: 'M' | 'F',
  activityLevel: ActivityLevel,
  objective: Objective,
  profile: Profile
): {
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
  formulaUsed: string;
} => {
  // 1. Calcular TMB usando a fórmula apropriada para o perfil
  const tmb = calculateTMB(weight, height, age, sex, profile);
  
  // 2. Calcular GET aplicando fator de atividade
  const get = calculateGET(tmb, activityLevel, profile);
  
  // 3. Calcular VET aplicando ajuste do objetivo
  const vet = calculateVET(get, objective);
  
  // 4. Calcular ajuste calórico
  const adjustment = vet - get;
  
  // 5. Calcular macronutrientes
  const macros = calculateMacrosByProfile(profile, weight, vet, objective);
  
  // 6. Determinar fórmula usada
  let formulaUsed = '';
  switch (profile) {
    case 'eutrofico':
      formulaUsed = 'Harris-Benedict Revisada';
      break;
    case 'sobrepeso_obesidade':
      formulaUsed = 'Harris-Benedict Clássica';
      break;
    case 'atleta':
      formulaUsed = 'Cunningham (estimativa)';
      break;
    default:
      formulaUsed = 'Harris-Benedict Revisada';
  }
  
  return {
    tmb,
    get,
    vet,
    adjustment,
    macros,
    formulaUsed
  };
};
