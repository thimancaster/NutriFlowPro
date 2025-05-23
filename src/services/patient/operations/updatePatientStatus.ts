
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

interface UpdatePatientStatusResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const updatePatientStatus = async (
  patientId: string, 
  userId: string,
  status: 'active' | 'archived'
): Promise<UpdatePatientStatusResult> => {
  try {
    // Input validation
    if (!patientId) return { success: false, error: 'Patient ID is required' };
    if (!userId) return { success: false, error: 'User ID is required' };
    
    // Update patient status
    const { data, error } = await supabase
      .from('patients')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', patientId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    return {
      success: true,
      data: data as Patient
    };
    
  } catch (error: any) {
    console.error('Error updating patient status:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to update patient status'
    };
  }
};
