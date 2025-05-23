
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

/**
 * Save a new patient to the database
 */
export const savePatient = async (patient: Partial<Patient>): Promise<Patient> => {
  try {
    // Prepare the data for insertion
    const patientData = {
      ...patient,
      // Convert complex objects to strings for storage if needed
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals,
      measurements: typeof patient.measurements === 'object' ? JSON.stringify(patient.measurements) : patient.measurements
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([patientData])
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
    
    return savedPatient;
  } catch (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
}

/**
 * Update an existing patient
 */
export const updatePatient = async (patient: Partial<Patient>): Promise<Patient> => {
  if (!patient.id) {
    throw new Error('Patient ID is required for updates');
  }

  try {
    // Prepare the data for update
    const patientData = {
      ...patient,
      // Convert complex objects to strings for storage if needed
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals,
      measurements: typeof patient.measurements === 'object' ? JSON.stringify(patient.measurements) : patient.measurements,
      updated_at: new Date()
    };

    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', patient.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to update patient');
    }

    // Convert the updated patient back to our application's format
    const updatedPatient: Patient = {
      ...data,
      status: (data.status as 'active' | 'archived') || 'active',
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {},
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals || {},
      measurements: typeof data.measurements === 'string' ? JSON.parse(data.measurements) : data.measurements || {}
    };

    // Invalidate relevant cache entries
    dbCache.invalidate(`${dbCache.KEYS.PATIENT}${patient.id}`);
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
    
    return updatedPatient;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

/**
 * Update patient status (archive/unarchive)
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
        updated_at: new Date()
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
}
