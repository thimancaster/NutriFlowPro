
export type ClinicalWorkflowStep = 
  | 'patient-selection'
  | 'patient-info'
  | 'anthropometry'
  | 'nutritional-evaluation'
  | 'meal-plan'
  | 'recommendations'
  | 'follow-up';

export interface ClinicalWorkflowState {
  currentStep: ClinicalWorkflowStep;
  patientId?: string;
  consultationId?: string;
  isCompleted: boolean;
}

export interface ClinicalContextType {
  activePatient: any | null;
  activeConsultation: any | null;
  currentStep: ClinicalWorkflowStep;
  setActivePatient: (patient: any | null) => void;
  setActiveConsultation: (consultation: any | null) => void;
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  startNewConsultation: (patient: any) => Promise<void>;
  saveConsultationData: (data: Partial<any>) => Promise<boolean>;
  completeConsultation: () => Promise<boolean>;
  resetWorkflow: () => void;
  isConsultationActive: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface AnthropometryData {
  id?: string;
  patient_id: string;
  date: string;
  weight?: number;
  height?: number;
  imc?: number;
  waist?: number;
  hip?: number;
  rcq?: number;
  arm?: number;
  thigh?: number;
  calf?: number;
  chest?: number;
  triceps?: number;
  subscapular?: number;
  suprailiac?: number;
  abdominal?: number;
  body_fat_pct?: number;
  lean_mass_kg?: number;
  muscle_mass_percentage?: number;
  water_percentage?: number;
}
