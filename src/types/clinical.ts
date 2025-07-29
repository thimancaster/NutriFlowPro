
export type ClinicalWorkflowStep = 
  | 'patient'
  | 'calculation' 
  | 'clinical'
  | 'meal_plan'
  | 'completed';

export interface ClinicalWorkflowState {
  currentStep: ClinicalWorkflowStep;
  activePatient?: any;
  consultationData?: any;
  isLoading: boolean;
  lastSaved?: string;
}
