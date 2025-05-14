
import { User } from '@supabase/supabase-js';
import { ConsultationData } from '@/types';
import { ToastApi } from '@/hooks/use-toast';

// Calculator state type
export interface CalculatorState {
  patientName: string;
  gender: string;
  age: string;
  weight: string;
  height: string;
  objective: string;
  activityLevel: string;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  profile: string;
  consultationType: 'primeira_consulta' | 'retorno';
}

// Calculator inputs props
export interface CalculatorInputsProps {
  patientName: string;
  setPatientName: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
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
  consultationType: 'primeira_consulta' | 'retorno';
  setConsultationType: (value: 'primeira_consulta' | 'retorno') => void;
  profile: string;
  setProfile: (value: string) => void;
  user: User | null;
  activePatient?: any;
}

// Calculator results props
export interface CalculatorResultsProps {
  bmr: number | null;
  tee: number | null;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
    proteinPerKg?: number;
  } | null;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  handleSavePatient: () => void;
  handleGenerateMealPlan: () => void;
  isSavingPatient: boolean;
  hasPatientName: boolean;
  user: User | null;
}

// Calculator actions props
export interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
}

// useCalculatorState props
export interface UseCalculatorStateProps {
  toast: ToastApi;
  user: User | null;
  setConsultationData: (data: ConsultationData) => void;
  activePatient?: any;
}

// useCalculationLogic props
export interface UseCalculationLogicProps {
  setBmr: (value: number) => void;
  setTee: (value: number) => void;
  setMacros: (value: { carbs: number; protein: number; fat: number; proteinPerKg?: number }) => void;
  tempPatientId: string | null;
  setTempPatientId: (value: string | null) => void;
  setConsultationData?: (data: ConsultationData) => void;
  toast: ToastApi;
  user: User | null;
}

// usePatientActions props
export interface UsePatientActionsProps {
  calculatorState: CalculatorState;
  bmr: number | null;
  tee: number | null;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
    proteinPerKg?: number;
  } | null;
  tempPatientId: string | null;
  setConsultationData?: (data: ConsultationData) => void;
  toast: ToastApi;
  user: User | null;
}

// MacroDistributionInputs props
export interface MacroDistributionInputsProps {
  carbsPercentage: string;
  setCarbsPercentage: (value: string) => void;
  proteinPercentage: string;
  setProteinPercentage: (value: string) => void;
  fatPercentage: string;
  setFatPercentage: (value: string) => void;
  bmr: number | null;
  tee: number | null;
  objective: string;
}
