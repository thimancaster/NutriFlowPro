
import { CalculatorState } from '../types';

// Get initial calculator state
export function getInitialCalculatorState(): CalculatorState {
  return {
    patientName: '',
    gender: 'female',
    age: '',
    weight: '',
    height: '',
    objective: 'manutenção',
    activityLevel: '1.2',
    carbsPercentage: '55',
    proteinPercentage: '20',
    fatPercentage: '25',
    consultationType: 'primeira_consulta'
  };
}

// Key for storing calculator results in storage
export const CALCULATOR_RESULTS_KEY = 'nutriflow_calculator_results';
