
import { Json } from '@/integrations/supabase/types';

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
  consultationType: 'primeira_consulta' | 'retorno';
  profile: string;
}

export interface CalculatorResults {
  bmr: number;
  tee: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
    proteinPerKg?: number;
  };
  tempPatientId?: string | null;
  status?: 'em_andamento' | 'completo';
}

export interface UseCalculatorStateProps {
  toast: any;
  user: any;
  setConsultationData: (data: any) => void;
  activePatient?: any;
}

export interface ConsultationData {
  weight: string | number;
  height: string | number;
  age: string | number;
  sex: string;
  objective: string;
  profile: string;
  activityLevel: string;
  results: {
    tmb: number;
    get: number;
    adjustment?: number;
    vet?: number; // Add VET property here to match usage in useCalculationLogic.ts
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPerKg?: number;
    }
  }
}

export interface CalculatorResultsProps {
  bmr: number | null;
  tee: number | null;
  macros: { carbs: number; protein: number; fat: number; proteinPerKg?: number } | null;
  carbsPercentage: string;
  proteinPercentage: string;
  fatPercentage: string;
  handleSavePatient: () => void;
  handleGenerateMealPlan: () => void;
  isSavingPatient: boolean;
  hasPatientName: boolean;
  user: any;
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
  user: any;
  activePatient?: any;
}

export interface MacroDistributionInputsProps {
  carbsPercentage: string;
  setCarbsPercentage: (value: string) => void;
  proteinPercentage: string;
  setProteinPercentage: (value: string) => void;
  fatPercentage: string;
  setFatPercentage: (value: string) => void;
  bmr?: number | null;
  tee?: number | null;
  objective?: string;
}

export interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
}
