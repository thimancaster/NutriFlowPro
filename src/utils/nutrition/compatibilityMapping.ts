
/**
 * Mapeamento de compatibilidade entre sistemas ENP e legado
 * Garante funcionamento correto dos macronutrientes para todas as fórmulas GER
 */

import { calculateMacros_ENP } from './enpCalculations';
import { Objective } from '@/types/consultation';

export interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

export interface MacroResult {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

/**
 * Wrapper que garante compatibilidade entre sistemas antigo e novo
 * Usa sempre os padrões ENP para consistência
 */
export function calculateMacrosENPWrapper(
  vet: number,
  weight: number,
  objective: Objective,
  profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' | 'magro' | 'obeso'
): MacroResult {
  // Mapear perfil para padrão ENP
  const mappedProfile = mapToENPProfile(profile);
  
  // Usar cálculo ENP
  const enpResult = calculateMacros_ENP(vet, weight, objective, mappedProfile);
  
  // Converter para formato esperado
  return {
    protein: {
      grams: enpResult.protein.grams,
      kcal: enpResult.protein.kcal,
      percentage: Math.round((enpResult.protein.kcal / vet) * 100 * 100) / 100
    },
    carbs: {
      grams: enpResult.carbs.grams,
      kcal: enpResult.carbs.kcal,
      percentage: Math.round((enpResult.carbs.kcal / vet) * 100 * 100) / 100
    },
    fat: {
      grams: enpResult.fat.grams,
      kcal: enpResult.fat.kcal,
      percentage: Math.round((enpResult.fat.kcal / vet) * 100 * 100) / 100
    },
    proteinPerKg: Math.round((enpResult.protein.grams / weight) * 100) / 100
  };
}

/**
 * Mapeia perfis do sistema legado para padrão ENP
 */
export function mapToENPProfile(profile: string): 'eutrofico' | 'sobrepeso_obesidade' | 'atleta' {
  switch (profile.toLowerCase()) {
    case 'magro':
    case 'normal':
    case 'eutrofico':
      return 'eutrofico';
    case 'obeso':
    case 'sobrepeso':
    case 'sobrepeso_obesidade':
      return 'sobrepeso_obesidade';
    case 'atleta':
      return 'atleta';
    default:
      console.warn(`Perfil desconhecido: ${profile}, usando eutrófico como padrão`);
      return 'eutrofico';
  }
}

/**
 * Mapeia perfis ENP para sistema legado (compatibilidade reversa)
 */
export function mapToLegacyProfile(profile: 'eutrofico' | 'sobrepeso_obesidade' | 'atleta'): 'magro' | 'obeso' | 'atleta' {
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
 * Valida se todos os requisitos para uma fórmula específica estão atendidos
 */
export function validateFormulaRequirements(
  formula: string,
  weight: number,
  height: number,
  age: number,
  bodyFatPercentage?: number
): { isValid: boolean; warnings: string[]; errors: string[] } {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Validações básicas
  if (weight <= 0 || weight > 500) errors.push('Peso deve estar entre 1 e 500 kg');
  if (height <= 0 || height > 250) errors.push('Altura deve estar entre 1 e 250 cm');
  if (age <= 0 || age > 120) errors.push('Idade deve estar entre 1 e 120 anos');
  
  // Validações específicas por fórmula
  switch (formula.toLowerCase()) {
    case 'katch_mcardle':
    case 'katch-mcardle':
      if (!bodyFatPercentage) {
        errors.push('Fórmula Katch-McArdle requer percentual de gordura corporal');
      } else if (bodyFatPercentage < 3 || bodyFatPercentage > 50) {
        errors.push('Percentual de gordura deve estar entre 3% e 50%');
      }
      break;
      
    case 'cunningham':
      if (!bodyFatPercentage) {
        errors.push('Fórmula Cunningham requer percentual de gordura corporal');
      } else if (bodyFatPercentage < 3 || bodyFatPercentage > 50) {
        errors.push('Percentual de gordura deve estar entre 3% e 50%');
      }
      break;
      
    case 'harris_benedict_revisada':
    case 'harris-benedict':
      const imc = weight / Math.pow(height / 100, 2);
      if (imc > 30) {
        warnings.push('Para pacientes obesos, considere usar a fórmula Owen');
      }
      break;
      
    case 'mifflin_st_jeor':
    case 'mifflin':
      if (age < 18 || age > 65) {
        warnings.push('Para menores de 18 ou maiores de 65 anos, considere Schofield');
      }
      break;
      
    case 'schofield':
      if (age >= 18 && age <= 65) {
        warnings.push('Para adultos saudáveis, Mifflin-St Jeor pode ser mais precisa');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}
