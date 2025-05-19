
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a patient permanently from the database
 */
export const deletePatient = async (patientId: string, userId: string) => {
  try {
    // Delete the patient
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)
      .eq('user_id', userId);

    if (error) throw error;

    return {
      success: true,
      message: 'Patient deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting patient:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
