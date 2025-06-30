
import { Patient } from '@/types';

export interface PatientContextState {
  activePatient: Patient | null;
  isPatientActive: boolean;
  selectedPatientId: string | null;
  recentPatients: Patient[];
  patients: Patient[];
  totalPatients: number;
  isLoading: boolean;
  error: Error | null;
  sessionData: {
    consultationActive: boolean;
    currentStep: string;
    lastActivity: Date | null;
  };
}

export interface PatientContextActions {
  setActivePatient: (patient: Patient | null) => void;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
  loadPatientById: (patientId: string) => Promise<void>;
  addRecentPatient: (patient: Patient) => void;
  updateSessionData: (data: Partial<PatientContextState['sessionData']>) => void;
  savePatient: (patientData: Partial<Patient>) => Promise<{ success: boolean; data?: Patient; error?: string }>;
  refreshPatients: () => Promise<void>;
}

export interface PatientContextType extends PatientContextState, PatientContextActions {}
