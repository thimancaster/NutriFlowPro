
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

/**
 * Response interface for patient operations
 */
export interface PatientResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

/**
 * Fetch a single patient by ID
 */
export const getPatient = async (patientId: string): Promise<PatientResponse> => {
  if (!patientId) {
    return { success: false, error: 'Patient ID is required' };
  }

  // Check cache first
  const cacheKey = `${dbCache.KEYS.PATIENT}${patientId}`;
  const cachedPatient = dbCache.get(cacheKey);
  
  if (cachedPatient) {
    return { success: true, data: cachedPatient };
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) {
      console.error('Supabase error fetching patient:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('No patient found with ID:', patientId);
      return { success: false, error: 'Patient not found' };
    }

    // Process data and convert types as needed
    const patient: Patient = {
      ...data,
      status: (data.status as 'active' | 'archived') || 'active',
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {},
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals || {},
      measurements: typeof data.measurements === 'string' ? JSON.parse(data.measurements) : data.measurements || {}
    };

    // Cache the result
    dbCache.set(cacheKey, patient);
    
    return { success: true, data: patient };
  } catch (error) {
    console.error('Error fetching patient:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error fetching patient' 
    };
  }
}
