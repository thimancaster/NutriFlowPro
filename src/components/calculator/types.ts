import { User } from "@supabase/supabase-js";
import { ConsultationData } from "@/types";
import { toast } from "@/hooks/use-toast";

export type ToastApi = typeof toast;

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
