
import { useEffect } from 'react';
import { Patient, ConsultationData } from '@/types';
import { ClinicalWorkflowStep } from '@/types/clinical';

export const useClinicalStorage = (
  activePatient: Patient | null,
  activeConsultation: ConsultationData | null,
  currentStep: ClinicalWorkflowStep,
  setActivePatient: (patient: Patient | null) => void,
  setActiveConsultation: (consultation: ConsultationData | null) => void,
  setCurrentStep: (step: ClinicalWorkflowStep) => void
) => {
  // Load from session storage on mount
  useEffect(() => {
    try {
      const storedPatient = sessionStorage.getItem('activePatient');
      const storedConsultation = sessionStorage.getItem('activeConsultation');
      const storedStep = sessionStorage.getItem('currentClinicalStep');
      
      if (storedPatient) {
        setActivePatient(JSON.parse(storedPatient));
      }
      
      if (storedConsultation) {
        setActiveConsultation(JSON.parse(storedConsultation));
      }
      
      if (storedStep) {
        setCurrentStep(storedStep as ClinicalWorkflowStep);
      }
    } catch (error) {
      console.error('Error loading clinical session data:', error);
    }
  }, [setActivePatient, setActiveConsultation, setCurrentStep]);
  
  // Update session storage when state changes
  useEffect(() => {
    if (activePatient) {
      sessionStorage.setItem('activePatient', JSON.stringify(activePatient));
    } else {
      sessionStorage.removeItem('activePatient');
    }
    
    if (activeConsultation) {
      sessionStorage.setItem('activeConsultation', JSON.stringify(activeConsultation));
    } else {
      sessionStorage.removeItem('activeConsultation');
    }
    
    sessionStorage.setItem('currentClinicalStep', currentStep);
  }, [activePatient, activeConsultation, currentStep]);
};

export default useClinicalStorage;
