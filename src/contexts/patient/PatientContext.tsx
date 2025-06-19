
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient } from '@/types';

interface PatientContextState {
  activePatient: Patient | null;
  isPatientActive: boolean;
  selectedPatientId: string | null;
  recentPatients: Patient[];
  isLoading: boolean;
  error: Error | null;
}

interface PatientContextActions {
  setActivePatient: (patient: Patient | null) => void;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
  loadPatientById: (patientId: string) => Promise<void>;
  addRecentPatient: (patient: Patient) => void;
}

interface PatientContextType extends PatientContextState, PatientContextActions {}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isPatientActive = activePatient !== null;

  const startPatientSession = useCallback((patient: Patient) => {
    setActivePatient(patient);
    setSelectedPatientId(patient.id);
    addRecentPatient(patient);
  }, []);

  const endPatientSession = useCallback(() => {
    setActivePatient(null);
    setSelectedPatientId(null);
  }, []);

  const loadPatientById = useCallback(async (patientId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // This would typically fetch the patient from an API or service
      // For now, we'll just set the selected ID
      setSelectedPatientId(patientId);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecentPatient = useCallback((patient: Patient) => {
    setRecentPatients(prev => {
      const filtered = prev.filter(p => p.id !== patient.id);
      return [patient, ...filtered].slice(0, 5); // Keep only 5 recent patients
    });
  }, []);

  const contextValue: PatientContextType = {
    // State
    activePatient,
    isPatientActive,
    selectedPatientId,
    recentPatients,
    isLoading,
    error,
    // Actions
    setActivePatient,
    startPatientSession,
    endPatientSession,
    loadPatientById,
    addRecentPatient,
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};
