
import { CalculatorState } from '@/contexts/CalculatorContext';

/**
 * Validates whether the input is a valid numeric value
 */
export const isNumericInputValid = (value: string | number): boolean => {
  if (typeof value === 'number') return !isNaN(value);
  return /^\d*\.?\d*$/.test(value);
};

/**
 * Validates calculator inputs to ensure all required fields are present and valid
 */
export const validateCalculatorInputs = (state: CalculatorState): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required fields
  if (!state.weight) errors.push('Weight is required');
  if (!state.height) errors.push('Height is required');
  if (!state.age) errors.push('Age is required');
  if (!state.gender) errors.push('Gender is required');
  if (!state.activityLevel) errors.push('Activity level is required');
  
  // Validate numeric fields
  if (state.weight && !isNumericInputValid(state.weight)) errors.push('Weight must be a valid number');
  if (state.height && !isNumericInputValid(state.height)) errors.push('Height must be a valid number');
  if (state.age && !isNumericInputValid(state.age)) errors.push('Age must be a valid number');
  
  // Check if macronutrient percentages sum to 100
  const carbPercentage = parseInt(state.carbPercentage) || 0;
  const proteinPercentage = parseInt(state.proteinPercentage) || 0;
  const fatPercentage = parseInt(state.fatPercentage) || 0;
  
  if (carbPercentage + proteinPercentage + fatPercentage !== 100) {
    errors.push('Macronutrient percentages must sum to 100%');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates inputs required for calculation
 */
export const validateInputsForCalculation = (state: CalculatorState): boolean => {
  const { isValid } = validateCalculatorInputs(state);
  return isValid;
};
