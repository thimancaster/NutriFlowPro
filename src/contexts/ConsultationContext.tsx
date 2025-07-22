
import React, { createContext, useContext, useState } from 'react';
import { ConsultationData, Patient } from '@/types';
import { MealPlan } from '@/types/mealPlan';

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
  mealPlan: MealPlan | null;
  setMealPlan: (mealPlan: MealPlan | null) => void;
}

export const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('patient-selection');
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  
  const clearConsultation = () => {
    setActivePatient(null);
    setConsultationData(null);
    setCurrentStep('patient-selection');
    setMealPlan(null);
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
        mealPlan,
        setMealPlan
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
