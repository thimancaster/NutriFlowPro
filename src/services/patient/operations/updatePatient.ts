
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { dbCache } from '@/services/dbCache';

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
    
    // Process complex objects for DB storage
    const processedData = {
      ...patientData,
      address: typeof patientData.address === 'object' ? 
        JSON.stringify(patientData.address) : patientData.address,
      goals: typeof patientData.goals === 'object' ? 
        JSON.stringify(patientData.goals) : patientData.goals,
      measurements: typeof patientData.measurements === 'object' ? 
        JSON.stringify(patientData.measurements) : patientData.measurements,
      updated_at: new Date().toISOString()
    };
    
    // Update patient
    const { data, error } = await supabase
      .from('patients')
      .update(processedData)
      .eq('id', patientId)
      .eq('user_id', userId)
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Convert complex data back to objects
    const updatedPatient = {
      ...data,
      address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {},
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : data.goals || {},
      measurements: typeof data.measurements === 'string' ? JSON.parse(data.measurements) : data.measurements || {}
    } as Patient;
    
    // Invalidate relevant cache entries
    dbCache.invalidate(`${dbCache.KEYS.PATIENT}${patientId}`);
    dbCache.invalidate(dbCache.KEYS.PATIENTS);
    
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
