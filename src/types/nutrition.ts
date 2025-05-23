
import { Profile, PROTEIN_RATIOS, LIPID_RATIOS, CALORIE_VALUES, ActivityLevel, ACTIVITY_FACTORS, Objective, OBJECTIVE_FACTORS } from './consultation';

export interface MacroValues {
  grams: number;
  kcal: number;
  percentage: number;
}

export interface CalculatedMacros {
  protein: MacroValues;
  carbs: MacroValues;
  fat: MacroValues;
  proteinPerKg: number;
}

export interface NutritionCalculation {
  bmr: number;
  tdee: number;
  vet: number;
  adjustment: number;
  macros: CalculatedMacros;
}

export interface AnthropometryData {
  weight: number;
  height: number;
  age: number;
  gender: 'M' | 'F';
  bodyFat?: number | null;
  imc?: number;
  waist?: number;
  hip?: number;
  neck?: number;
}

// Re-export the constants for ease of access
export {
  PROTEIN_RATIOS,
  LIPID_RATIOS,
  CALORIE_VALUES,
  ACTIVITY_FACTORS,
  OBJECTIVE_FACTORS
};

// Export types from consultation for consistent usage
export type { Profile, ActivityLevel, Objective };
