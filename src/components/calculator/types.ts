
import { ConsultationData, ToastApi } from '@/types';

export interface CalculatorState {
  weight: string;
  height: string;
  age: string;
  gender: "male" | "female";
  activityLevel: string;
  objective: string;
  carbsPercentage: number;
  proteinPercentage: number;
  fatPercentage: number;
  patientName: string;
  consultationType: string;
  lowCarbOption?: boolean; // Added property
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
