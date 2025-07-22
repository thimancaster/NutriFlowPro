
import React, { createContext, useContext, useState } from 'react';
import { ConsultationData, Patient } from '@/types';

// Define the consultation steps
export type ConsultationStep = 'patient-selection' | 'evaluation' | 'meal-plan' | 'review';

interface ConsultationContextType {
  activePatient: Patient | null;
  setActivePatient: (patient: Patient | null) => void;
  consultationData: ConsultationData | null;
  setConsultationData: (data: ConsultationData | null) => void;
  currentStep: ConsultationStep;
  setCurrentStep: (step: ConsultationStep) => void;
  isConsultationActive: boolean;
  clearConsultation: () => void;
  mealPlan: any;
}

export const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('patient-selection');
  
  const clearConsultation = () => {
    setActivePatient(null);
    setConsultationData(null);
    setCurrentStep('patient-selection');
  };
  
  return (
    <ConsultationContext.Provider
      value={{
        activePatient,
        setActivePatient,
        consultationData,
        setConsultationData,
        currentStep,
        setCurrentStep,
        isConsultationActive: !!activePatient,
        clearConsultation,
        mealPlan: null
      }}
    >
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
