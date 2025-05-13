
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { preparePatientForDb } from '../utils/patientDataUtils';

/**
 * Save a patient to the database (create or update)
 */
export const savePatient = async (patientData: Partial<Patient>, userId: string) => {
  try {
    // Ensure user_id is set
    patientData.user_id = userId;
    
    // Set updated_at timestamp
    patientData.updated_at = new Date().toISOString();
    
    // Format data for database
    const cleanedData = preparePatientForDb(patientData);
    
    if (patientData.id) {
      // Update existing patient
      const { error } = await supabase
        .from('patients')
        .update(cleanedData)
        .eq('id', patientData.id);
        
      if (error) throw error;
      
      return {
        success: true,
        data: patientData.id
      };
    } else {
      // Create new patient
      cleanedData.created_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('patients')
        .insert(cleanedData)
        .select('id')
        .single();
        
      if (error) throw error;
      
      return {
        success: true,
        data: data.id
      };
    }
  } catch (error: any) {
    console.error('Error saving patient:', error);
    return {
      success: false,
      error: error.message || 'Failed to save patient'
    };
  }
};
