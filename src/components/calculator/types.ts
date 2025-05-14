
import { User } from "@supabase/supabase-js";
import { ConsultationData } from "@/types";
import { ToastActionElement } from "@/components/ui/toast";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
  action?: ToastActionElement;
}

export interface Toast {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
  open: boolean;
}

export interface ToastApi {
  toast: (props: ToastProps) => {
    id: string;
    dismiss: () => void;
    update: (props: ToastProps) => void;
  };
  dismiss: (toastId?: string) => void;
}

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
  consultationType: string;
}

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
  consultationType: string;
  setConsultationType: (value: string) => void;
  profile: string;
  setProfile: (value: string) => void;
  user: User | null;
  activePatient?: any;
}

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

export interface UseCalculatorStateProps {
  toast: ToastApi;
  user: User | null;
  setConsultationData: (data: ConsultationData) => void;
  activePatient?: any;
}

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

export interface UseCalculationLogicProps {
  setBmr: (value: number | null) => void;
  setTee: (value: number | null) => void;
  setMacros: (value: any | null) => void;
  setConsultationData?: (data: ConsultationData) => void;
  toast: ToastApi;
  user: User | null;
  tempPatientId: string | null;
  setTempPatientId: (value: string | null) => void;
}
