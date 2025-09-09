
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';

export interface PatientServiceResponse {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const getPatient = async (id: string): Promise<PatientServiceResponse> => {
  try {
    console.log('[ATTEND:E2E] Loading patient data for:', id);
    
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[ATTEND:E2E] Error loading patient:', error);
      return { success: false, error: error.message };
    }
    
    console.log('[ATTEND:E2E] Patient data loaded successfully');
    return { success: true, data };
  } catch (error: any) {
    console.error('[ATTEND:E2E] Exception loading patient:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

export { PatientServiceResponse as PatientResponse };
