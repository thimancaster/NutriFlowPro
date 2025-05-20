
import { Patient } from '@/types';

export interface PatientContextState {
  activePatient: Patient | null;
  isPatientActive: boolean;
  selectedPatientId: string | null;
  recentPatients: Patient[];
  isLoading: boolean;
  error: Error | null;
}

export interface PatientContextActions {
  setActivePatient: (patient: Patient | null) => void;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
  loadPatientById: (patientId: string) => Promise<void>;
  addRecentPatient: (patient: Patient) => void;
}

export interface PatientContextType extends PatientContextState, PatientContextActions {}
