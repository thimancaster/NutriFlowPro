
import { supabase } from '@/integrations/supabase/client';

/**
 * Auto-save consultation data periodically
 */
export const handleAutoSaveConsultation = async (
  consultationId: string,
  data: {
    bmr: number;
    tdee: number;
    weight: number;
    height: number;
    age: number;
    gender: string;
    protein: number;
    carbs: number;
    fats: number;
    activity_level: string;
    goal: string;
    status?: string;
  }
): Promise<boolean> => {
  try {
    if (!consultationId) {
      console.warn('No consultation ID provided for auto-save');
      return false;
    }
    
    const { error } = await supabase
      .from('calculations')
      .update({
        ...data,
        // The last_auto_save column will be automatically updated by a database trigger
      })
      .eq('id', consultationId);
    
    if (error) {
      console.error('Error during auto-save:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception during auto-save:', error);
    return false;
  }
};

/**
 * Update the status of a consultation
 */
export const updateConsultationStatus = async (
  consultationId: string,
  status: 'em_andamento' | 'concluida' | 'cancelada' // Must match check_status_calc constraint
): Promise<boolean> => {
  try {
    if (!consultationId) {
      console.warn('No consultation ID provided for status update');
      return false;
    }
    
    const { error } = await supabase
      .from('calculations')
      .update({ status })
      .eq('id', consultationId);
    
    if (error) {
      console.error('Error updating consultation status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception during status update:', error);
    return false;
  }
};

/**
 * Update consultation type
 */
export const updateConsultationType = async (
  consultationId: string,
  type: 'primeira_consulta' | 'retorno'
): Promise<boolean> => {
  try {
    if (!consultationId) {
      console.warn('No consultation ID provided for type update');
      return false;
    }
    
    const { error } = await supabase
      .from('calculations')
      .update({ tipo: type })
      .eq('id', consultationId);
    
    if (error) {
      console.error('Error updating consultation type:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception during type update:', error);
    return false;
  }
};
