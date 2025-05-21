
import { supabase } from '@/integrations/supabase/client';
import { convertDbToPatient } from '../utils/patientDataUtils';

/**
 * Get a patient by ID
 */
export const getPatient = async (patientId: string) => {
  try {
    console.log('Getting patient with ID:', patientId);
    
    // First try to get the patient with the specific ID
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (error) {
      console.error('Supabase error getting patient:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No patient found with ID:', patientId);
      throw new Error('Patient not found');
    }
    
    // Log the raw data from database for debugging
    console.log('Raw data from database:', data);
    
    const patient = convertDbToPatient(data);
    console.log('Patient data converted successfully:', patient);
    
    return {
      success: true,
      data: patient
    };
  } catch (error: any) {
    console.error('Error getting patient:', error);
    return {
      success: false,
      error: error.message || 'Failed to get patient'
    };
  }
};
