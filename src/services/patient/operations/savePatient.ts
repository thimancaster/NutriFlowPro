
import { supabase } from '@/integrations/supabase/client';
import { Patient, AddressDetails } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

interface SavePatientResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

/**
 * Save a patient to the database (insert new or update existing)
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
    
    // Prepare the data for insertion/update
    const patientData = {
      ...patient,
      // Convert complex objects to strings for storage if needed
      address: typeof patient.address === 'object' ? JSON.stringify(patient.address) : patient.address,
      goals: typeof patient.goals === 'object' ? JSON.stringify(patient.goals) : patient.goals,
      measurements: typeof patient.measurements === 'object' ? JSON.stringify(patient.measurements) : patient.measurements,
      name: patient.name // Ensure name is definitely present
    };

    let data, error;

    if (patient.id) {
      // Update existing patient
      console.log('Updating existing patient with ID:', patient.id);
      const updateResult = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patient.id)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new patient
      console.log('Inserting new patient');
      const insertResult = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Failed to save patient');
    }

    // Convert the saved patient back to our application's format
    const savedPatient: Patient = processPatientData(data);

    // Invalidate relevant cache entries
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
    if (patient.id) {
      dbCache.invalidate(`${dbCache.KEYS.PATIENT}${patient.id}`);
    }
    
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

const processPatientData = (data: any): Patient => {
  // Process address data properly
  let addressData: string | AddressDetails | undefined;
  
  if (data.address) {
    if (typeof data.address === 'string') {
      try {
        // Try to parse the address as JSON if it's a string
        addressData = JSON.parse(data.address as string) as AddressDetails;
      } catch (e) {
        // If parsing fails, keep it as a string
        addressData = data.address as string;
      }
    } else if (typeof data.address === 'object') {
      // If it's already an object, use it directly
      addressData = data.address as AddressDetails;
    }
  }

  // Safely cast gender with fallback
  const safeGender = (gender: any): 'male' | 'female' | 'other' | undefined => {
    if (gender === 'male' || gender === 'female' || gender === 'other') {
      return gender;
    }
    return undefined;
  };

  // Process database data into our Patient type
  const patient: Patient = {
    ...data,
    status: (data.status as 'active' | 'archived') || 'active',
    gender: safeGender(data.gender),
    goals: (data.goals as Record<string, any>) || {},
    measurements: (data.measurements as Record<string, any>) || {},
    address: addressData
  };

  return patient;
};
