
import { CalculatorState } from '../types';

/**
 * Returns the initial state for the calculator
 */
export const getInitialCalculatorState = (): CalculatorState => {
  return {
    weight: '',
    height: '',
    age: '',
    gender: 'female',
    activityLevel: 'moderado',
    objective: 'manutenção',
    carbsPercentage: '50', // Changed to string
    proteinPercentage: '25', // Changed to string
    fatPercentage: '25', // Changed to string
    patientName: '',
    consultationType: 'primeira_consulta',
    lowCarbOption: false,
    profile: 'magro'
  };
};
