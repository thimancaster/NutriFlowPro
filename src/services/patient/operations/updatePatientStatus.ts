
import { supabase } from '@/integrations/supabase/client';

/**
 * Update a patient's status (active/archived)
 */
export const updatePatientStatus = async (patientId: string, userId: string, status: 'active' | 'archived') => {
  try {
    console.log(`Updating patient ${patientId} to status ${status} for user ${userId}`);
    
    const { data, error } = await supabase
      .from('patients')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', patientId)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Status update successful:", data);
    
    return {
      success: true,
      data: data?.[0],
      message: `Patient ${status === 'archived' ? 'archived' : 'activated'} successfully`
    };
  } catch (error: any) {
    console.error(`Error ${status === 'archived' ? 'archiving' : 'activating'} patient:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
