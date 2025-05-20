
import React, { createContext, useContext } from 'react';
import { PatientContextType } from './types';
import { usePatientState } from './usePatientState';

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const patientState = usePatientState();
  
  // Create the complete context value object
  const value: PatientContextType = {
    activePatient: patientState.activePatient,
    isPatientActive: patientState.isPatientActive,
    selectedPatientId: patientState.selectedPatientId,
    recentPatients: patientState.recentPatients,
    isLoading: patientState.isLoading,
    error: patientState.error,
    setActivePatient: patientState.setActivePatient,
    startPatientSession: patientState.startPatientSession,
    endPatientSession: patientState.endPatientSession,
    loadPatientById: patientState.loadPatientById,
    addRecentPatient: patientState.addRecentPatient
  };
  
  return (
    <PatientContext.Provider value={value}>
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
