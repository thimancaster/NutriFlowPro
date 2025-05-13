
import { supabase } from '@/integrations/supabase/client';

/**
 * Update a patient's status (active/archived)
 */
export const updatePatientStatus = async (patientId: string, status: 'active' | 'archived') => {
  try {
    const { error } = await supabase
      .from('patients')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', patientId);
      
    if (error) throw error;
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Error updating patient status:', error);
    return {
      success: false,
      error: error.message || 'Failed to update patient status'
    };
  }
};
