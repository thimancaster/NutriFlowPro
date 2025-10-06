
import React, { createContext, useContext } from 'react';
import { ConsultationData } from '@/types';
import { useActivePatient } from '@/hooks/useActivePatient';

// Define the consultation steps
export type ConsultationStep = 'patient-selection' | 'evaluation' | 'meal-plan' | 'review';

interface ConsultationContextType {
  activePatient: ReturnType<typeof useActivePatient>['patient'];
  setActivePatient: ReturnType<typeof useActivePatient>['setActivePatient'];
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
  // Use unified patient context instead of local state
  const { patient: activePatient, setActivePatient } = useActivePatient();
  
  // This context is now deprecated - components should use useConsultationData instead
  console.warn('ConsultationContext is deprecated. Use useConsultationData instead.');
  
  const clearConsultation = () => {
    setActivePatient(null);
  };
  
  return (
    <ConsultationContext.Provider
      value={{
        activePatient,
        setActivePatient,
        consultationData: null, // Deprecated
        setConsultationData: () => {}, // Deprecated
        currentStep: 'patient-selection', // Deprecated
        setCurrentStep: () => {}, // Deprecated
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
