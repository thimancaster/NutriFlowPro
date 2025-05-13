
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";
import { dbCache } from "./dbCache";

/**
 * Service to handle patient-related database interactions
 */
export const PatientService = {
  /**
   * Save patient data to the database
   */
  savePatient: async (patient: Partial<Patient>, userId: string): Promise<{success: boolean, data?: Patient, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!patient.name) {
        throw new Error('Patient name is required');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const patientData = {
        ...patient,
        user_id: userId,
        name: patient.name // Explicitly include name to satisfy TypeScript
      };
      
      let response;
      
      // Update existing patient
      if (patient.id) {
        response = await supabase
          .from('patients')
          .update({
            ...patientData,
            updated_at: new Date().toISOString()
          })
          .eq('id', patient.id)
          .select('*')
          .single();
      } else {
        // Insert new patient
        response = await supabase
          .from('patients')
          .insert(patientData)
          .select('*')
          .single();
      }
      
      if (response.error) {
        console.error("Database error:", response.error);
        throw new Error(response.error.message);
      }
      
      // Cache the patient data
      if (response.data?.id) {
        dbCache.set(`${dbCache.KEYS.PATIENT}${response.data.id}`, response.data);
      }
      
      return {
        success: true,
        data: response.data as Patient
      };
    } catch (error: any) {
      console.error('Error saving patient:', error);
      return {
        success: false,
        error: error.message || 'Failed to save patient'
      };
    }
  },
  
  /**
   * Get a patient by ID with optimized caching
   */
  getPatient: async (patientId: string): Promise<{success: boolean, data?: Patient, error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cachedData = dbCache.get<Patient>(`${dbCache.KEYS.PATIENT}${patientId}`);
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
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Patient not found');
      }
      
      // Save to cache
      dbCache.set(`${dbCache.KEYS.PATIENT}${patientId}`, data);
      
      return {
        success: true,
        data: data as Patient
      };
    } catch (error: any) {
      console.error('Error getting patient:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patient'
      };
    }
  },
  
  /**
   * Get all patients for a user with optimized caching
   */
  getUserPatients: async (userId: string): Promise<{success: boolean, data?: Patient[], error?: string}> => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data as Patient[]
      };
    } catch (error: any) {
      console.error('Error getting patients:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patients'
      };
    }
  }
};
