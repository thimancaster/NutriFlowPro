
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, ConsultationData } from '@/types';
import { useAuth } from './auth/AuthContext';

interface ConsultationDataContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  updateConsultationData: (updates: Partial<ConsultationData>) => void;
  clearConsultationData: () => void;
  startNewConsultation: (patient: Patient) => Promise<void>;
  isConsultationActive: boolean;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (!context) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};

interface ConsultationDataProviderProps {
  children: ReactNode;
}

export const ConsultationDataProvider: React.FC<ConsultationDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);

  // Clear consultation data when user logs out
  useEffect(() => {
    if (!user) {
      setSelectedPatient(null);
      setConsultationData(null);
    }
  }, [user]);

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    setConsultationData(current => {
      if (!current) return null;
      return { ...current, ...updates };
    });
  };

  const clearConsultationData = () => {
    setConsultationData(null);
    setSelectedPatient(null);
  };

  const startNewConsultation = async (patient: Patient) => {
    console.log('Starting new consultation for patient:', patient.name);
    
    setSelectedPatient(patient);
    
    // Initialize basic consultation data structure
    const newConsultationData: ConsultationData = {
      id: `temp-${Date.now()}`,
      patient_id: patient.id,
      weight: 0,
      height: 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0,
      gender: patient.gender === 'male' ? 'M' : 'F',
      activity_level: 'moderado',
      patient: {
        name: patient.name,
        id: patient.id
      },
      results: null
    };
    
    setConsultationData(newConsultationData);
  };

  const isConsultationActive = selectedPatient !== null && consultationData !== null;

  const value: ConsultationDataContextType = {
    selectedPatient,
    setSelectedPatient,
    consultationData,
    setConsultationData,
    updateConsultationData,
    clearConsultationData,
    startNewConsultation,
    isConsultationActive
  };

  return (
    <ConsultationDataContext.Provider value={value}>
      {children}
    </ConsultationDataContext.Provider>
  );
};
