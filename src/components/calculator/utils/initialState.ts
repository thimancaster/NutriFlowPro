
import { CalculatorState } from '../types';

/**
 * Get initial state for calculator
 */
export const getInitialCalculatorState = (): CalculatorState => {
  return {
    patientName: '',
    gender: 'male',
    age: '',
    weight: '',
    height: '',
    objective: 'manutenção',
    activityLevel: '1.55', // Moderadamente ativo como padrão
    carbsPercentage: '55',
    proteinPercentage: '20',
    fatPercentage: '25',
    consultationType: 'primeira_consulta',
    profile: 'magro', // Default profile
  };
};

// Key for storing calculator results in storage
export const CALCULATOR_RESULTS_KEY = 'nutriflow_calculator_results';
