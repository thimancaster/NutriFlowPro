/**
 * REPORTS SERVICE
 * Fetches historical calculation data for comparative reports
 */

import { supabase } from '@/integrations/supabase/client';

export interface CalculationHistoryRecord {
  id: string;
  patient_id: string;
  user_id: string;
  calculation_date: string;
  consultation_number: number;
  weight: number;
  height: number;
  age: number;
  sex: string;
  body_profile: string;
  activity_level: string;
  objective: string;
  tmb: number;
  get: number;
  vet: number;
  protein_g: number;
  protein_kcal: number;
  carbs_g: number;
  carbs_kcal: number;
  fat_g: number;
  fat_kcal: number;
  formula_used: string;
  notes?: string;
}

export interface PatientEvolutionData {
  patient: {
    id: string;
    name: string;
  };
  calculations: CalculationHistoryRecord[];
}

/**
 * Fetch calculation history for a specific patient
 */
export async function fetchPatientCalculationHistory(
  patientId: string
): Promise<CalculationHistoryRecord[]> {
  const { data, error } = await supabase
    .from('calculation_history')
    .select('*')
    .eq('patient_id', patientId)
    .order('calculation_date', { ascending: true });

  if (error) {
    console.error('[Reports Service] Error fetching patient history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch calculation history for all patients of current user
 */
export async function fetchAllPatientsCalculationHistory(
  userId: string
): Promise<PatientEvolutionData[]> {
  // First, get all patients
  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, name')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (patientsError) {
    console.error('[Reports Service] Error fetching patients:', patientsError);
    throw patientsError;
  }

  if (!patients || patients.length === 0) {
    return [];
  }

  // Fetch calculations for all patients
  const { data: calculations, error: calcError } = await supabase
    .from('calculation_history')
    .select('*')
    .eq('user_id', userId)
    .in('patient_id', patients.map(p => p.id))
    .order('calculation_date', { ascending: true });

  if (calcError) {
    console.error('[Reports Service] Error fetching calculations:', calcError);
    throw calcError;
  }

  // Group calculations by patient
  const grouped = patients.map(patient => ({
    patient,
    calculations: (calculations || []).filter(c => c.patient_id === patient.id)
  })).filter(g => g.calculations.length > 0);

  return grouped;
}

/**
 * Fetch latest calculations for all active patients (for comparison)
 */
export async function fetchLatestCalculationsForAllPatients(
  userId: string
): Promise<PatientEvolutionData[]> {
  const allData = await fetchAllPatientsCalculationHistory(userId);
  
  // Get only the latest calculation for each patient
  return allData.map(pd => ({
    ...pd,
    calculations: pd.calculations.slice(-1) // Last calculation only
  }));
}

/**
 * Calculate metrics evolution (percentage changes)
 */
export function calculateEvolution(
  history: CalculationHistoryRecord[]
): {
  tmb: { value: number; change: number };
  get: { value: number; change: number };
  vet: { value: number; change: number };
  weight: { value: number; change: number };
  proteinG: { value: number; change: number };
  carbsG: { value: number; change: number };
  fatG: { value: number; change: number };
} | null {
  if (history.length < 2) return null;

  const first = history[0];
  const last = history[history.length - 1];

  const calculateChange = (initial: number, final: number) => {
    if (initial === 0) return 0;
    return ((final - initial) / initial) * 100;
  };

  return {
    tmb: {
      value: last.tmb,
      change: calculateChange(first.tmb, last.tmb)
    },
    get: {
      value: last.get,
      change: calculateChange(first.get, last.get)
    },
    vet: {
      value: last.vet,
      change: calculateChange(first.vet, last.vet)
    },
    weight: {
      value: last.weight,
      change: calculateChange(first.weight, last.weight)
    },
    proteinG: {
      value: last.protein_g,
      change: calculateChange(first.protein_g, last.protein_g)
    },
    carbsG: {
      value: last.carbs_g,
      change: calculateChange(first.carbs_g, last.carbs_g)
    },
    fatG: {
      value: last.fat_g,
      change: calculateChange(first.fat_g, last.fat_g)
    }
  };
}
