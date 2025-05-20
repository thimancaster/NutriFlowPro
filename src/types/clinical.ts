
import { Patient, ConsultationData } from '@/types';

// Define workflow steps for patient care
export type ClinicalWorkflowStep = 
  | 'patient-selection' 
  | 'patient-info' 
  | 'anthropometry' 
  | 'nutritional-evaluation' 
  | 'meal-plan' 
  | 'recommendations'
  | 'follow-up';

export interface ClinicalContextType {
  // Active data
  activePatient: Patient | null;
  activeConsultation: ConsultationData | null;
  currentStep: ClinicalWorkflowStep;
  
  // State setters
  setActivePatient: (patient: Patient | null) => void;
  setActiveConsultation: (consultation: ConsultationData | null) => void;
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  
  // Workflow actions
  startNewConsultation: (patient: Patient) => Promise<void>;
  saveConsultationData: (data: Partial<ConsultationData>) => Promise<boolean>;
  completeConsultation: () => Promise<boolean>;
  resetWorkflow: () => void;
  
  // State indicators
  isConsultationActive: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface ClinicalState {
  activePatient: Patient | null;
  activeConsultation: ConsultationData | null;
  currentStep: ClinicalWorkflowStep;
  isSaving: boolean;
  lastSaved: Date | null;
}
