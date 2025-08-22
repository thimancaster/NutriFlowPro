
import { supabase } from '@/integrations/supabase/client';
import { PatientResponse } from '@/types/patient';

export const getPatient = async (id: string): Promise<PatientResponse | null> => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patient:', error);
    return null;
  }
};
