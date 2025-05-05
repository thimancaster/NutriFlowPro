
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
}

export interface CalculatorResults {
  bmr: number;
  tee: number;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  tempPatientId?: string | null;
}

export interface UseCalculatorStateProps {
  toast: any;
  user: any;
  setConsultationData: (data: any) => void;
}

export interface ConsultationData {
  weight: string;
  height: string;
  age: string;
  sex: string;
  objective: string;
  profile: string;
  activityLevel: string;
  results: {
    tmb: number;
    fa: number;
    get: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    }
  }
}
