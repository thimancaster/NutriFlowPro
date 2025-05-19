
import { supabase } from '@/integrations/supabase/client';
import { cleanUndefinedValues } from '../utils/patientDataUtils';
import { Patient } from '@/types';

export const savePatient = async (patientData: Partial<Patient>, userId: string) => {
  try {
    // Clean undefined values to avoid overwriting with null
    const cleanedData = cleanUndefinedValues({
      ...patientData,
      user_id: userId,
      updated_at: new Date().toISOString()
    });
    
    console.log('Saving patient data:', cleanedData);

    // If there's an ID, update existing patient, otherwise insert new
    if (patientData.id) {
      const { data, error } = await supabase
        .from('patients')
        .update(cleanedData)
        .eq('id', patientData.id)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Database error while updating patient:', error);
        throw error;
      }
      
      return {
        success: true,
        data: data[0],
        message: 'Patient updated successfully'
      };
    } else {
      // For new patients, set default status to active
      const newPatientData = {
        ...cleanedData,
        status: 'active',
        name: patientData.name || 'New Patient' // Ensure name is present
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(newPatientData)
        .select();

      if (error) {
        console.error('Database error while inserting patient:', error);
        throw error;
      }

      return {
        success: true,
        data: data[0],
        message: 'Patient created successfully'
      };
    }
  } catch (error: any) {
    console.error('Error in savePatient:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export functions from the separated files
export { updatePatientStatus } from './updatePatientStatus';
export { updatePatient } from './updatePatient';
