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
    
    if (data) {
      console.log('[ATTEND:E2E] Patient data loaded successfully');
      // Parse address if it's a JSON string
      let parsedAddress = data.address || null;
      if (typeof data.address === 'string' && data.address.startsWith('{')) {
        try {
          parsedAddress = JSON.parse(data.address);
        } catch {
          parsedAddress = data.address;
        }
      }

      const transformedData = {
        ...data,
        gender: (data.gender === 'male' || data.gender === 'female' || data.gender === 'other') 
          ? data.gender as 'male' | 'female' | 'other'
          : 'other' as const,
        status: (data.status === 'active' || data.status === 'archived')
          ? data.status as 'active' | 'archived'
          : 'active' as const,
        goals: data.goals ? (typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals) : {},
        secondaryPhone: data.secondaryphone || '',
        address: parsedAddress
      };
        return { success: true, data: transformedData };
      } else {
        return { success: false, error: "Patient not found" };
      }
    } catch (error: any) {
      console.error('[ATTEND:E2E] Exception loading patient:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  };

export type { PatientServiceResponse as PatientResponse };