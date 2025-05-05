
import { storageUtils } from '@/utils/storageUtils';
import { CalculatorState, CalculatorResults } from './types';
import { CALCULATOR_RESULTS_KEY } from './calculatorUtils';

// Save calculator state to storage
export function saveCalculatorState(state: CalculatorState): void {
  storageUtils.setLocalItem('nutriflow_calculator_state', state);
}

// Save calculator results to storage
export function saveCalculatorResults(
  bmr: number,
  tee: number,
  macros: { 
    carbs: number;
    protein: number;
    fat: number;
  },
  tempPatientId: string | null
): void {
  storageUtils.setLocalItem<CalculatorResults>(CALCULATOR_RESULTS_KEY, {
    bmr,
    tee,
    macros,
    tempPatientId
  });
}

// Get calculator state from storage
export function getCalculatorState(): CalculatorState | null {
  return storageUtils.getLocalItem<CalculatorState>('nutriflow_calculator_state');
}

// Get calculator results from storage
export function getCalculatorResults(): CalculatorResults | null {
  return storageUtils.getLocalItem<CalculatorResults>(CALCULATOR_RESULTS_KEY);
}

// Save consultation data to storage
export function saveConsultationData(consultationData: any): void {
  storageUtils.setLocalItem('nutriflow_consultation_data', consultationData);
}

// Clear all calculator data from storage
export function clearCalculatorData(): void {
  storageUtils.removeLocalItem('nutriflow_calculator_state');
  storageUtils.removeLocalItem(CALCULATOR_RESULTS_KEY);
  storageUtils.removeLocalItem('nutriflow_consultation_data');
}
