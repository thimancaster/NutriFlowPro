
import React, { createContext, useState, useContext } from 'react';
import { Patient, ConsultationData } from '@/types';
import { ClinicalContextType, ClinicalWorkflowStep } from '@/types/clinical';
import useClinicalActions from '@/hooks/useClinicalActions';
import useClinicalStorage from '@/hooks/useClinicalStorage';

const ClinicalContext = createContext<ClinicalContextType | undefined>(undefined);

export const ClinicalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<ClinicalWorkflowStep>('patient-selection');
  
  const { 
    isSaving, 
    lastSaved,
    startNewConsultation: startConsultation,
    saveConsultationData: saveData,
    completeConsultation: completeConsult
  } = useClinicalActions();
  
  // Handle storage
  useClinicalStorage(
    activePatient,
    activeConsultation,
    currentStep,
    setActivePatient,
    setActiveConsultation,
    setCurrentStep
  );
  
  // Workflow actions with internal state management
  const startNewConsultation = async (patient: Patient) => {
    await startConsultation(patient, setActivePatient, setActiveConsultation, setCurrentStep);
  };
  
  const saveConsultationData = async (data: Partial<ConsultationData>): Promise<boolean> => {
    return await saveData(activeConsultation, setActiveConsultation, data);
  };
  
  const completeConsultation = async (): Promise<boolean> => {
    return await completeConsult(activeConsultation);
  };
  
  // Reset workflow
  const resetWorkflow = () => {
    setActivePatient(null);
    setActiveConsultation(null);
    setCurrentStep('patient-selection');
    sessionStorage.removeItem('activePatient');
    sessionStorage.removeItem('activeConsultation');
    sessionStorage.removeItem('currentClinicalStep');
  };
  
  return (
    <ClinicalContext.Provider
      value={{
        activePatient,
        activeConsultation,
        currentStep,
        setActivePatient,
        setActiveConsultation,
        setCurrentStep,
        startNewConsultation,
        saveConsultationData,
        completeConsultation,
        resetWorkflow,
        isConsultationActive: !!activeConsultation,
        isSaving,
        lastSaved
      }}
    >
      {children}
    </ClinicalContext.Provider>
  );
};

export const useClinical = () => {
  const context = useContext(ClinicalContext);
  if (context === undefined) {
    throw new Error('useClinical must be used within a ClinicalProvider');
  }
  return context;
};

export type { ClinicalWorkflowStep };
