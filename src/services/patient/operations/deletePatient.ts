
import { supabase } from '@/integrations/supabase/client';
import { dbCache } from '@/services/dbCache';

/**
 * Delete a patient from the database
 */
export const deletePatient = async (patientId: string): Promise<void> => {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId);

    if (error) {
      throw error;
    }

    // Invalidate relevant cache entries
    dbCache.invalidate(`${dbCache.KEYS.PATIENT}${patientId}`);
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
    dbCache.invalidate(`${dbCache.KEYS.CONSULTATIONS}${patientId}`);
    dbCache.invalidate(`${dbCache.KEYS.MEAL_PLANS}${patientId}`);
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
}
