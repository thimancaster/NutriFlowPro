
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export async function savePatient(patientData: Partial<Patient>, userId: string) {
  try {
    // Check if we're updating or creating
    const isUpdate = !!patientData.id;
    
    if (isUpdate) {
      // Update existing patient
      patientData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patientData.id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Patient updated successfully'
      };
    } else {
      // Create new patient
      const { data, error } = await supabase
        .from('patients')
        .insert([
          { 
            ...patientData,
            user_id: userId,
            status: 'active'
          }
        ])
        .select('*')
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data,
        message: 'Patient created successfully'
      };
    }
  } catch (error: any) {
    console.error('Error saving patient:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}
