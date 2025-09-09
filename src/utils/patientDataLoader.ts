
import { supabase } from '@/integrations/supabase/client';
import { PatientInput } from '@/types';

export interface PatientMetrics {
  weight?: number;
  height?: number;
  bmi?: number;
  measurement_date: string;
}

export interface PatientNutritionContext {
  patientData: PatientInput;
  latestMetrics?: PatientMetrics;
  lastObjective?: string;
  hasCompleteData: boolean;
  missingFields: string[];
}

/**
 * Loads patient nutrition context for calculator auto-population
 */
export const loadPatientNutritionContext = async (patientId: string): Promise<PatientNutritionContext> => {
  console.log('[CALC:AUTOLOAD] Loading nutrition context for patient:', patientId);
  
  try {
    // Get patient basic data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error(`Patient not found: ${patientError?.message}`);
    }

    // Get latest measurements
    const { data: measurements } = await supabase
      .from('measurements')
      .select('weight, height, imc, measurement_date')
      .eq('patient_id', patientId)
      .order('measurement_date', { ascending: false })
      .limit(1);

    const latestMetrics = measurements?.[0];

    // Get last consultation objective
    const { data: consultations } = await supabase
      .from('consultations')
      .select('metrics')
      .eq('patient_id', patientId)
      .order('date', { ascending: false })
      .limit(1);

    const lastObjective = consultations?.[0]?.metrics && typeof consultations[0].metrics === 'object' 
      ? (consultations[0].metrics as any).objective 
      : undefined;

    // Calculate age from birth_date
    const age = patient.birth_date ? calculateAge(patient.birth_date) : 0;

    // Build patient input
    const patientData: PatientInput = {
      id: patientId,
      sex: patient.gender === 'male' ? 'male' : 'female',
      gender: patient.gender === 'male' ? 'M' : 'F',
      age,
      weight: latestMetrics?.weight || 0,
      height: latestMetrics?.height || 0,
      objective: lastObjective || 'manutencao',
      activityLevel: 'moderado' // Default activity level
    };

    // Check for missing essential fields
    const missingFields: string[] = [];
    if (!patientData.weight) missingFields.push('weight');
    if (!patientData.height) missingFields.push('height');
    if (!patientData.age) missingFields.push('age');
    if (!patientData.sex) missingFields.push('sex');

    const hasCompleteData = missingFields.length === 0;

    console.log('[CALC:AUTOLOAD] Context loaded:', {
      hasCompleteData,
      missingFields,
      weight: patientData.weight,
      height: patientData.height,
      age: patientData.age
    });

    return {
      patientData,
      latestMetrics,
      lastObjective,
      hasCompleteData,
      missingFields
    };

  } catch (error: any) {
    console.error('[CALC:AUTOLOAD] Error loading context:', error);
    throw error;
  }
};

/**
 * Saves patient metrics to measurements table
 */
export const savePatientMetrics = async (
  patientId: string, 
  userId: string,
  metrics: {
    weight?: number;
    height?: number;
    notes?: string;
  }
): Promise<boolean> => {
  console.log('[ATTEND:E2E] Saving patient metrics:', metrics);
  
  try {
    const { error } = await supabase
      .from('measurements')
      .insert({
        patient_id: patientId,
        user_id: userId,
        weight: metrics.weight,
        height: metrics.height,
        imc: metrics.weight && metrics.height ? 
          Number((metrics.weight / Math.pow(metrics.height / 100, 2)).toFixed(1)) : 
          null,
        notes: metrics.notes,
        measurement_date: new Date().toISOString()
      });

    if (error) {
      console.error('[ATTEND:E2E] Error saving metrics:', error);
      return false;
    }

    console.log('[ATTEND:E2E] Metrics saved successfully');
    return true;
  } catch (error) {
    console.error('[ATTEND:E2E] Exception saving metrics:', error);
    return false;
  }
};

/**
 * Updates patient stable data (gender, birth_date)
 */
export const updatePatientStableData = async (
  patientId: string,
  updates: {
    gender?: 'male' | 'female' | 'other';
    birth_date?: string;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', patientId);

    if (error) {
      console.error('[ATTEND:E2E] Error updating patient:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ATTEND:E2E] Exception updating patient:', error);
    return false;
  }
};

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
