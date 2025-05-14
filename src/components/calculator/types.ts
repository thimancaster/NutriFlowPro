
import { ConsultationData } from '@/types';

export interface ToastApi {
  toast: (props: any) => void;
  dismiss: (id?: string) => void;
}

export interface CalculatorState {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female";
  activityLevel: string;
  objective: string;
  carbsPercentage: string; // Changed to string to match actual usage
  proteinPercentage: string; // Changed to string to match actual usage
  fatPercentage: string; // Changed to string to match actual usage
  patientName: string;
  consultationType: string;
  lowCarbOption?: boolean;
  profile?: string;
  [key: string]: any;
}

export interface CalculatorResults {
  bmr: number | null;
  get: number | null;
  adjustedGet: number | null;
  macros: {
    carbs: number | null;
    protein: number | null;
    fat: number | null;
  } | null;
}

export interface CalculatorInputsProps {
  patientName: string;
  setPatientName: (value: string) => void;
  gender: "male" | "female";
  setGender: (value: "male" | "female") => void;
  age: string;
  setAge: (value: string) => void;
  weight: string;
  setWeight: (value: string) => void;
  height: string;
  setHeight: (value: string) => void;
  objective: string;
  setObjective: (value: string) => void;
  activityLevel: string;
  setActivityLevel: (value: string) => void;
  consultationType: string;
  setConsultationType: (value: 'primeira_consulta' | 'retorno') => void;
  profile?: string;
  setProfile?: (value: string) => void;
  user?: any;
  activePatient?: any;
}

export interface CalculatorResultsProps {
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number, protein: number, fat: number } | null;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  handleSavePatient: () => void;
  handleGenerateMealPlan: () => void;
  isSavingPatient: boolean;
  hasPatientName: boolean;
  user: any;
}

export interface UseCalculatorFormProps {
  initialValues?: Partial<CalculatorState>;
  onSubmit?: (values: CalculatorState) => void;
}

export interface UseCalculatorResultsProps {
  onSave?: (results: any) => void;
  calculateResults: (state: CalculatorState) => void;
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number, protein: number, fat: number } | null;
}

export interface UseCalculationLogicProps {
  setBmr: (value: number) => void;
  setTee: (value: number) => void;
  setMacros: (value: any) => void;
  setConsultationData?: (data: ConsultationData) => void;
  toast: ToastApi;
  user: any;
  tempPatientId: string | null;
  setTempPatientId: (id: string) => void;
}

export interface UsePatientActionsProps {
  selectedPatient: any;
  setSelectedPatient: (patient: any) => void;
  onPatientSelect?: (patient: any) => void;
  toast: ToastApi;
}

export interface UseCalculatorStateProps {
  toast: ToastApi;
  user: any;
  setConsultationData: (data: ConsultationData) => void;
  activePatient: any;
}
