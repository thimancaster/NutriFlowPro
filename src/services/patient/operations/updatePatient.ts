
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

interface UpdatePatientResult {
  success: boolean;
  data?: Patient;
  error?: string;
}

export const updatePatient = async (
  patientId: string,
  patientData: Partial<Patient>
): Promise<UpdatePatientResult> => {
  try {
    // Input validation
    if (!patientId) return { success: false, error: 'Patient ID is required' };
    
    // Process complex objects for DB storage
    const processedData = {
      ...patientData,
      address: typeof patientData.address === 'object' ? 
        JSON.stringify(patientData.address) : patientData.address,
      goals: typeof patientData.goals === 'object' ? 
        JSON.stringify(patientData.goals) : patientData.goals,
      updated_at: new Date().toISOString()
    };
    
    // Update patient
    const { data, error } = await supabase
      .from('patients')
      .update(processedData)
      .eq('id', patientId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Convert complex data back to objects
    const updatedPatient = {
      ...data,
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {},
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals || {},
      // Ensure birth_date is always present (required in Patient interface)
      birth_date: data.birth_date || ''
    } as Patient;
    
    return {
      success: true,
      data: updatedPatient
    };
    
  } catch (error: any) {
    console.error('Error updating patient:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to update patient'
    };
  }
};
