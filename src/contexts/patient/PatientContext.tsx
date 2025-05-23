
import React, { createContext, useContext } from 'react';
import { PatientContextType } from './types';
import { usePatientState } from './usePatientState';

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const patientState = usePatientState();
  
  return (
    <PatientContext.Provider value={patientState}>
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
