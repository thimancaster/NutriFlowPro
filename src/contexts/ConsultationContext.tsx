
import React, { createContext, useContext, useState } from 'react';
import { Patient, ConsultationData, ConsultationStep } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type ConsultationContextType = {
  isConsultationActive: boolean;
  startConsultation: () => void;
  endConsultation: () => void;
  saveDraftConsultation: (data: Partial<ConsultationData>) => void;
  getDraftConsultation: () => Partial<ConsultationData> | null;
  currentStep: ConsultationStep;
  setCurrentStep: (step: ConsultationStep) => void;
  generateConsultationId: () => Promise<string>;
};

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export const ConsultationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConsultationActive, setIsConsultationActive] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<ConsultationStep>('dashboard');

  const startConsultation = () => {
    setIsConsultationActive(true);
    setCurrentStep('dashboard');
  };

  const endConsultation = () => {
    setIsConsultationActive(false);
    setCurrentStep('dashboard');
    // Clear any draft data
    localStorage.removeItem('draftConsultation');
  };

  const saveDraftConsultation = (data: Partial<ConsultationData>) => {
    localStorage.setItem('draftConsultation', JSON.stringify(data));
  };

  const getDraftConsultation = (): Partial<ConsultationData> | null => {
    const draft = localStorage.getItem('draftConsultation');
    if (draft) {
      try {
        return JSON.parse(draft);
      } catch (e) {
        console.error('Error parsing draft consultation:', e);
      }
    }
    return null;
  };

  const generateConsultationId = async () => {
    return uuidv4();
  };

  const value = {
    isConsultationActive,
    startConsultation,
    endConsultation,
    saveDraftConsultation,
    getDraftConsultation,
    currentStep,
    setCurrentStep,
    generateConsultationId,
  };

  return <ConsultationContext.Provider value={value}>{children}</ConsultationContext.Provider>;
};

export const useConsultation = () => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
};
