
import { supabase } from '@/integrations/supabase/client';

/**
 * Delete a patient permanently from the database
 * Also deletes related anthropometry records to avoid constraint violations
 */
export const deletePatient = async (patientId: string, userId: string) => {
  try {
    // Delete any anthropometry records for this patient first
    const { error: anthropometryError } = await supabase
      .from('anthropometry')
      .delete()
      .eq('patient_id', patientId);

    if (anthropometryError) {
      console.error('Error deleting anthropometry records:', anthropometryError.message);
      // Continue to attempt to delete patient even if anthropometry deletion fails
    }

    // Delete appointments associated with the patient
    const { error: appointmentError } = await supabase
      .from('appointments')
      .delete()
      .eq('patient_id', patientId);
      
    if (appointmentError) {
      console.error('Error deleting appointment records:', appointmentError.message);
      // Continue to attempt to delete patient even if appointment deletion fails
    }

    // Delete calculations associated with the patient
    const { error: calculationError } = await supabase
      .from('calculations')
      .delete()
      .eq('patient_id', patientId);
      
    if (calculationError) {
      console.error('Error deleting calculation records:', calculationError.message);
      // Continue to attempt to delete patient even if calculation deletion fails
    }

    // Delete meal plans associated with the patient
    const { error: mealPlanError } = await supabase
      .from('meal_plans')
      .delete()
      .eq('patient_id', patientId);
      
    if (mealPlanError) {
      console.error('Error deleting meal plan records:', mealPlanError.message);
      // Continue to attempt to delete patient even if meal plan deletion fails
    }

    // Now delete the patient
    const { error: patientError } = await supabase
      .from('patients')
      .delete()
      .eq('id', patientId)
      .eq('user_id', userId);

    if (patientError) throw patientError;

    return {
      success: true,
      message: 'Patient deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting patient:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
