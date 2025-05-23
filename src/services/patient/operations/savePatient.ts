
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

interface SavePatientResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

/**
 * Save a new patient to the database
 */
export const savePatient = async (patient: Partial<Patient>): Promise<SavePatientResult> => {
  try {
    // Ensure name is required
    if (!patient.name) {
      return { 
        success: false,
        error: 'Patient name is required'
      };
    }
    
    // Prepare the data for insertion
    const patientData = {
      ...patient,
      // Convert complex objects to strings for storage if needed
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals,
      measurements: typeof patient.measurements === 'object' ? JSON.stringify(patient.measurements) : patient.measurements,
      name: patient.name // Ensure name is definitely present
    };

    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to save patient');
    }

    // Convert the saved patient back to our application's format
    const savedPatient: Patient = {
      ...data,
      status: (data.status as 'active' | 'archived') || 'active',
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {},
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals || {},
      measurements: typeof data.measurements === 'string' ? JSON.parse(data.measurements) : data.measurements || {}
    };

    // Invalidate relevant cache entries
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
    
    return {
      success: true,
      data: savedPatient
    };
    
  } catch (error: any) {
    console.error('Error saving patient:', error);
    return {
      success: false,
      error: error.message || 'Failed to save patient'
    };
  }
};

/**
 * Update an existing patient's status
 */
export const updatePatientStatus = async (
  patientId: string, 
  status: 'active' | 'archived'
): Promise<void> => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  try {
    const { error } = await supabase
      .from('patients')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId);

    if (error) {
      throw error;
    }

    // Invalidate relevant cache entries
    dbCache.invalidate(`${dbCache.KEYS.PATIENT}${patientId}`);
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
  } catch (error) {
    console.error('Error updating patient status:', error);
    throw error;
  }
};
