
export type ClinicalWorkflowStep = 
  | 'patient-selection'
  | 'patient-info'
  | 'anthropometry'
  | 'nutritional-evaluation'
  | 'meal-plan'
  | 'recommendations'
  | 'follow-up'
  | 'completed';

export interface ClinicalWorkflowState {
  currentStep: ClinicalWorkflowStep;
  activePatient?: any;
  consultationData?: any;
  isLoading: boolean;
  lastSaved?: string;
}
