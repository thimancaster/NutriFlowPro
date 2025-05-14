
import { supabase } from '@/integrations/supabase/client';
import { cleanUndefinedValues } from '../utils/patientDataUtils';
import { Patient } from '@/types';

export const savePatient = async (patientData: Partial<Patient>, userId: string) => {
  try {
    // Clean undefined values to avoid overwriting with null
    const cleanedData = cleanUndefinedValues({
      ...patientData,
      user_id: userId,
      updated_at: new Date().toISOString()
    });

    // If there's an ID, update existing patient, otherwise insert new
    if (patientData.id) {
      const { data, error } = await supabase
        .from('patients')
        .update(cleanedData)
        .eq('id', patientData.id)
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      
      return {
        success: true,
        data: data[0],
        message: 'Patient updated successfully'
      };
    } else {
      // For new patients, set default status to active
      const newPatientData = {
        ...cleanedData,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('patients')
        .insert(newPatientData)
        .select();

      if (error) throw error;

      return {
        success: true,
        data: data[0],
        message: 'Patient created successfully'
      };
    }
  } catch (error: any) {
    console.error('Error in savePatient:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper to update patient status
// Modified to accept a required userId parameter
export const updatePatientStatus = async (
  patientId: string, 
  userId: string, 
  status: 'active' | 'archived'
) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', patientId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return {
      success: true,
      data: data[0],
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

// Helper to update patient with specific changes
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
