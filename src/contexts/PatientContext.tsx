
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Patient } from '@/types';
import { storageUtils } from '@/utils/storageUtils';

interface PatientContextType {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  isPatientActive: boolean;
  startPatientSession: (patient: Patient) => void;
  endPatientSession: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  // Check for active patient in sessionStorage on mount
  useEffect(() => {
    const storedPatient = storageUtils.getSessionItem('activePatient');

    if (storedPatient) {
      setActivePatient(storedPatient);
    }
  }, []);

  // Update sessionStorage when active patient changes
  useEffect(() => {
    if (activePatient) {
      storageUtils.setSessionItem('activePatient', activePatient);
    } else {
      storageUtils.removeSessionItem('activePatient');
    }
  }, [activePatient]);

  const startPatientSession = (patient: Patient) => {
    setActivePatient(patient);
  };

  const endPatientSession = () => {
    setActivePatient(null);
    storageUtils.removeSessionItem('activePatient');
  };

  return (
    <PatientContext.Provider
      value={{
        activePatient,
        setActivePatient,
        isPatientActive: !!activePatient,
        startPatientSession,
        endPatientSession
      }}
    >
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
