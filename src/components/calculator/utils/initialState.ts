
import { CalculatorState } from '../types';

/**
 * Returns the initial state for calculator
 */
export function getInitialCalculatorState(): CalculatorState {
  return {
    patientName: '',
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    objective: 'manutenção',
    activityLevel: 'moderado',
    carbsPercentage: '55',
    proteinPercentage: '25',
    fatPercentage: '20',
    profile: 'magro',
    consultationType: 'primeira_consulta'
  };
}
