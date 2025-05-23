
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

/**
 * Fetch a single patient by ID
 */
export const getPatient = async (patientId: string): Promise<Patient | null> => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  // Check cache first
  const cacheKey = `${dbCache.KEYS.PATIENT}${patientId}`;
  const cachedPatient = dbCache.get(cacheKey);
  
  if (cachedPatient) {
    return cachedPatient;
  }

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
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
    
    return patient;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
}
