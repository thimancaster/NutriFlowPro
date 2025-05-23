
import { supabase } from '@/integrations/supabase/client';

interface DeletePatientResult {
  success: boolean;
  error?: string;
}

export const deletePatient = async (
  patientId: string,
  userId: string
): Promise<DeletePatientResult> => {
  try {
    // Input validation
    if (!patientId) return { success: false, error: 'Patient ID is required' };
    if (!userId) return { success: false, error: 'User ID is required' };
    
    // Delete patient - or consider setting a 'deleted' flag instead of actual deletion
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return {
      success: true
    };
    
  } catch (error: any) {
    console.error('Error deleting patient:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to delete patient'
    };
  }
};
