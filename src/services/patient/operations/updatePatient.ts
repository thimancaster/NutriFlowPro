
import { supabase } from '@/integrations/supabase/client';
import { cleanUndefinedValues } from '../utils/patientDataUtils';
import { Patient } from '@/types';

/**
 * Update patient with specific changes
 */
export const updatePatient = async (
  patientId: string,
  userId: string,
  updates: Partial<Patient>
) => {
  try {
    // Clean undefined values to avoid overwriting with null
    const cleanedUpdates = cleanUndefinedValues({
      ...updates,
      updated_at: new Date().toISOString()
    });

    const { data, error } = await supabase
      .from('patients')
      .update(cleanedUpdates)
      .eq('id', patientId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return {
      success: true,
      data: data[0],
      message: 'Patient updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating patient:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
