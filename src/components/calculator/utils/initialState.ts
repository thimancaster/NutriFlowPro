
import { CalculatorState } from '../types';

/**
 * Returns the initial state for the calculator with empty fields
 */
export const getInitialCalculatorState = (): CalculatorState => {
  return {
    weight: '',
    height: '',
    age: '',
    gender: 'female',
    activityLevel: 'moderado',
    objective: 'manutenção',
    carbsPercentage: '',
    proteinPercentage: '',
    fatPercentage: '',
    patientName: '',
    consultationType: 'primeira_consulta',
    lowCarbOption: false,
    profile: 'magro'
  };
};
