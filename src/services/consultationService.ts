import { supabase } from "@/integrations/supabase/client";
import { ConsultationData } from "@/types";
import { dbCache } from "./dbCache";

/**
 * Service to handle consultation-related database interactions
 */
export const ConsultationService = {
  /**
   * Save consultation data
   */
  saveConsultation: async (
    userId: string, 
    patientId: string, 
    consultationData: ConsultationData,
    consultationType: string = 'primeira_consulta'
  ): Promise<{success: boolean, data?: any, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!userId || !patientId || !consultationData) {
        throw new Error('Missing required data for saving consultation');
      }
      
      // Convert string values to numbers where needed
      const weight = consultationData.weight ? parseFloat(String(consultationData.weight)) : 0;
      const height = consultationData.height ? parseFloat(String(consultationData.height)) : 0;
      const age = consultationData.age ? parseInt(String(consultationData.age)) : 0;
      
      const { data, error } = await supabase
        .from('calculations')
        .insert({
          user_id: userId,
          patient_id: patientId,
          weight: weight,
          height: height,
          age: age,
          bmr: consultationData.results?.tmb || 0,
          tdee: consultationData.results?.get || 0,
          protein: consultationData.results?.macros.protein || 0,
          carbs: consultationData.results?.macros.carbs || 0,
          fats: consultationData.results?.macros.fat || 0,
          gender: consultationData.sex === 'M' ? 'male' : 'female',
          activity_level: consultationData.activityLevel,
          goal: consultationData.objective,
          tipo: consultationType,
          status: 'em_andamento'
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      // Invalidate consultations cache for this patient
      dbCache.invalidate(`${dbCache.KEYS.CONSULTATIONS}${patientId}`);
      
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error saving consultation:', error);
      return {
        success: false,
        error: error.message || 'Failed to save consultation'
      };
    }
  },
  
  /**
   * Auto-save consultation data periodically
   */
  autoSaveConsultation: async (
    consultationId: string,
    updatedData: Partial<any>
  ): Promise<{success: boolean, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!consultationId) {
        throw new Error('Consultation ID is required for auto-save');
      }
      
      const { error } = await supabase
        .from('calculations')
        .update(updatedData)
        .eq('id', consultationId);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error auto-saving consultation:', error);
      return {
        success: false,
        error: error.message || 'Failed to auto-save consultation'
      };
    }
  },
  
  /**
   * Update the status of a consultation
   */
  updateConsultationStatus: async (
    consultationId: string,
    status: 'em_andamento' | 'completo'
  ): Promise<{success: boolean, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!consultationId) {
        throw new Error('Consultation ID is required');
      }
      
      const { error } = await supabase
        .from('calculations')
        .update({ status })
        .eq('id', consultationId);
      
      if (error) {
        throw error;
      }
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error updating consultation status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update consultation status'
      };
    }
  },
  
  /**
   * Get consultation history for a patient with caching
   */
  getPatientConsultations: async (patientId: string): Promise<{success: boolean, data?: any[], error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cacheKey = `${dbCache.KEYS.CONSULTATIONS}${patientId}`;
      const cachedData = dbCache.get<any[]>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData.data
        };
      }
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await supabase
        .from('calculations')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Save to cache
      dbCache.set(cacheKey, data || []);
      
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error getting patient consultations:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patient consultations'
      };
    }
  }
};
