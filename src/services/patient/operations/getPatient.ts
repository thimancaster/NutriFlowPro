
import { supabase } from '@/integrations/supabase/client';
import { convertDbToPatient } from '../utils/patientDataUtils';

/**
 * Get a patient by ID
 */
export const getPatient = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
      
    if (error) throw error;
    
    const patient = convertDbToPatient(data);
    
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
