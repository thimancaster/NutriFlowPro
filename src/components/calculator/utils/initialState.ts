
import { CalculatorState } from '../types';

/**
 * Returns the initial state for the calculator form
 * Always returns empty/default values to ensure clean start
 */
export const getInitialCalculatorState = (): CalculatorState => {
  return {
    patientName: '',
    gender: 'female',
    age: '',
    weight: '',
    height: '',
    objective: 'manutenção',
    activityLevel: 'moderado',
    consultationType: 'primeira_consulta',
    profile: 'eutrofico',
    carbsPercentage: '50',
    proteinPercentage: '20', 
    fatPercentage: '30',
    lowCarbOption: false,
    gerFormula: undefined, // NEW: No formula selected initially (required selection)
    bodyFatPercentage: '' // NEW: Empty body fat percentage
  };
};
