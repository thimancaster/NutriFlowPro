
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

interface UpdatePatientResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const updatePatient = async (
  patientId: string,
  userId: string,
  patientData: Partial<Patient>
): Promise<UpdatePatientResult> => {
  try {
    // Input validation
    if (!patientId) return { success: false, error: 'Patient ID is required' };
    if (!userId) return { success: false, error: 'User ID is required' };
    
    // Add updated_at timestamp
    const updatedData = {
      ...patientData,
      updated_at: new Date()
    };
    
    // Update patient
    const { data, error } = await supabase
      .from('patients')
      .update(updatedData)
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
    console.error('Error updating patient:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to update patient'
    };
  }
};
