
/**
 * Patient data synchronization utilities
 */

import { Patient } from '@/types';

export interface SyncData {
  patientName: string;
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
}

export const useCalculatorSync = () => {
  const syncPatientData = (
    patient: Patient,
    currentData: SyncData,
    updateFn: (field: string, value: any) => void
  ) => {
    updateFn('patientName', patient.name);
    updateFn('weight', (patient as any).weight || currentData.weight);
    updateFn('height', (patient as any).height || currentData.height);
    updateFn('age', (patient as any).age || currentData.age);
    updateFn('sex', patient.gender === 'male' ? 'M' : 'F');
  };

  return {
    syncPatientData
  };
};
