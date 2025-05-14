
import { CalculatorState } from './types';
import { logger } from '@/utils/logger';

// Storage key constants
const CALCULATOR_STATE_KEY = 'calculatorState';
const CALCULATOR_RESULTS_KEY = 'calculatorResults';

// Save calculator state to localStorage
export function saveCalculatorState(state: CalculatorState): void {
  try {
    localStorage.setItem(CALCULATOR_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.error('Error saving calculator state:', error);
  }
}

// Get calculator state from localStorage
export function getCalculatorState(): CalculatorState | null {
  try {
    const savedState = localStorage.getItem(CALCULATOR_STATE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    logger.error('Error getting calculator state:', error);
    return null;
  }
}

// Save calculator results to localStorage
export function saveCalculatorResults(
  bmr: number, 
  tee: number, 
  macros: { carbs: number; protein: number; fat: number; proteinPerKg?: number },
  tempPatientId: string | null
): void {
  try {
    localStorage.setItem(CALCULATOR_RESULTS_KEY, JSON.stringify({
      bmr,
      tee,
      macros,
      tempPatientId
    }));
  } catch (error) {
    logger.error('Error saving calculator results:', error);
  }
}

// Get calculator results from localStorage
export function getCalculatorResults(): {
  bmr: number;
  tee: number;
  macros: { carbs: number; protein: number; fat: number; proteinPerKg?: number };
  tempPatientId: string | null;
} | null {
  try {
    const savedResults = localStorage.getItem(CALCULATOR_RESULTS_KEY);
    return savedResults ? JSON.parse(savedResults) : null;
  } catch (error) {
    logger.error('Error getting calculator results:', error);
    return null;
  }
}

// Clear all calculator data from localStorage
export function clearCalculatorData(): void {
  try {
    localStorage.removeItem(CALCULATOR_STATE_KEY);
    localStorage.removeItem(CALCULATOR_RESULTS_KEY);
  } catch (error) {
    logger.error('Error clearing calculator data:', error);
  }
}
