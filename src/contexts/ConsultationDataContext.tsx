
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConsultationData } from '@/types/consultation';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';

interface ConsultationDataContextType {
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  updateConsultationData: (updates: Partial<ConsultationData>) => void;
  clearConsultationData: () => void;
  isLoading: boolean;
  error: string | null;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { activePatient } = usePatient();
  const { user } = useAuth();

  // Initialize consultation data when patient is selected
  useEffect(() => {
    if (activePatient && user && !consultationData) {
      console.log('Initializing consultation data for patient:', activePatient.id);
      const initialData: ConsultationData = {
        patient_id: activePatient.id,
        user_id: user.id,
        patient: activePatient,
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        created_at: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      setConsultationData(initialData);
    }
  }, [activePatient, user, consultationData]);

  // Clear consultation data when patient changes
  useEffect(() => {
    if (!activePatient && consultationData) {
      console.log('Clearing consultation data - no active patient');
      setConsultationData(null);
    }
  }, [activePatient, consultationData]);

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    console.log('Updating consultation data:', updates);
    setConsultationData(prev => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  };

  const clearConsultationData = () => {
    console.log('Clearing consultation data');
    setConsultationData(null);
    setError(null);
  };

  return (
    <ConsultationDataContext.Provider
      value={{
        consultationData,
        setConsultationData,
        updateConsultationData,
        clearConsultationData,
        isLoading,
        error
      }}
    >
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (context === undefined) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};
