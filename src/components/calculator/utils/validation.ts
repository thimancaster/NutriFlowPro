
import { CalculatorState } from '../types';

/**
 * Validates calculator input state
 * @returns String with error message or null if valid
 */
export function validateCalculatorInputs(state: CalculatorState): string | null {
  // Required fields
  if (!state.patientName.trim()) {
    return 'Nome do paciente é obrigatório';
  }
  if (!state.age || isNaN(Number(state.age)) || Number(state.age) <= 0 || Number(state.age) > 120) {
    return 'Idade inválida';
  }
  if (!state.weight || isNaN(Number(state.weight)) || Number(state.weight) <= 0 || Number(state.weight) > 300) {
    return 'Peso inválido';
  }
  if (!state.height || isNaN(Number(state.height)) || Number(state.height) <= 0 || Number(state.height) > 250) {
    return 'Altura inválida';
  }
  
  // Validate gender
  if (!['male', 'female'].includes(state.gender)) {
    return 'Sexo inválido';
  }
  
  // Validate activity level
  if (!['sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'].includes(state.activityLevel)) {
    return 'Nível de atividade inválido';
  }
  
  // Validate objective
  if (!['emagrecimento', 'manutenção', 'hipertrofia'].includes(state.objective)) {
    return 'Objetivo inválido';
  }
  
  // Validate macro percentages
  const carbsPercent = Number(state.carbsPercentage);
  const proteinPercent = Number(state.proteinPercentage);
  const fatPercent = Number(state.fatPercentage);
  
  if (
    isNaN(carbsPercent) || isNaN(proteinPercent) || isNaN(fatPercent) ||
    carbsPercent < 0 || proteinPercent < 0 || fatPercent < 0
  ) {
    return 'Percentuais de macronutrientes inválidos';
  }
  
  // Check if percentages add up to 100%
  if (Math.abs(carbsPercent + proteinPercent + fatPercent - 100) > 1) {
    return 'Percentuais de macronutrientes devem somar 100%';
  }
  
  return null;
}

/**
 * Validate numeric input
 * @returns True if valid
 */
export function isNumericInputValid(value: string): boolean {
  // Allow empty values (for clearing inputs)
  if (!value) {
    return true;
  }
  
  // Check if it's a valid number
  return /^\d*\.?\d*$/.test(value);
}
