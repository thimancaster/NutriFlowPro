
import { supabase } from '@/integrations/supabase/client';

export interface PatientServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const getPatient = async (id: string): Promise<PatientServiceResponse> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};
