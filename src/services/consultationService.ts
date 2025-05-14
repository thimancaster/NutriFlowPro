import { supabase } from '@/integrations/supabase/client';
import { ConsultationData } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { prepareForSupabase } from '@/utils/dateUtils';

export const ConsultationService = {
  /**
   * Save the consultation data to the database
   */
  async saveConsultation(consultationData: Partial<ConsultationData>) {
    try {
      // Ensure required fields are present
      if (!consultationData.weight || !consultationData.height || 
          !consultationData.gender || !consultationData.activity_level || 
          !consultationData.objective) {
        throw new Error('Missing required consultation fields');
      }
      
      // Format the data to match the database schema
      const formattedData = {
        id: consultationData.id || uuidv4(),
        user_id: consultationData.user_id,
        patient_id: consultationData.patient_id,
        weight: consultationData.weight,
        height: consultationData.height,
        age: typeof consultationData.age === 'string' ? parseInt(consultationData.age) : consultationData.age,
        gender: consultationData.gender,
        goal: consultationData.objective, // Map objective to goal field
        activity_level: consultationData.activityLevel,
        tipo: consultationData.tipo || 'primeira_consulta',
        status: 'em_andamento',
        bmr: consultationData.results?.bmr || 0,
        tdee: consultationData.results?.vet || 0, // Map vet to tdee
        protein: consultationData.results?.macros?.protein || 0,
        carbs: consultationData.results?.macros?.carbs || 0,
        fats: consultationData.results?.macros?.fat || 0
        // Other fields will be filled with defaults by Supabase
      };
      
      // Prepare for Supabase (handle dates, etc.)
      const preparedData = prepareForSupabase(formattedData, false);
      
      const { data, error } = await supabase
        .from('calculations')
        .upsert([preparedData])
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { 
        success: true, 
        data,
        message: 'Consultation saved successfully'
      };
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      return { 
        success: false, 
        error: error.message,
        message: 'Error saving consultation'
      };
    }
  },
  
  /**
   * Auto-save a consultation in progress
   */
  async autoSaveConsultation(consultationId: string, updates: Record<string, any>) {
    try {
      if (!consultationId) {
        throw new Error('Consultation ID is required for auto-save');
      }
      
      // Format the data for update
      const formattedData = {
        ...updates,
        last_auto_save: new Date().toISOString()
      };
      
      // Prepare for Supabase
      const preparedData = prepareForSupabase(formattedData, false);
      
      const { data, error } = await supabase
        .from('calculations')
        .update([preparedData])
        .eq('id', consultationId)
        .select();
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error auto-saving consultation:', error);
      return false;
    }
  },
  
  /**
   * Update consultation status
   */
  async updateConsultationStatus(consultationId: string, status: 'em_andamento' | 'completo') {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .update([{ status }])
        .eq('id', consultationId)
        .select();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating consultation status:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get consultations for a patient
   */
  async getPatientConsultations(patientId: string) {
    try {
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching patient consultations:', error);
      return { success: false, error: error.message };
    }
  }
};
