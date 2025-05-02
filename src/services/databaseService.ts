
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MealPlan, Patient, ConsultationData } from "@/types";

/**
 * Service to handle all database interactions
 */
export const DatabaseService = {
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
      
      const patientData = {
        ...patient,
        user_id: userId
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data as Patient
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
   * Get a patient by ID
   */
  getPatient: async (patientId: string): Promise<{success: boolean, data?: Patient, error?: string}> => {
    try {
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
   * Save consultation data
   */
  saveConsultation: async (
    userId: string, 
    patientId: string, 
    consultationData: ConsultationData
  ): Promise<{success: boolean, data?: any, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!userId || !patientId || !consultationData) {
        throw new Error('Missing required data for saving consultation');
      }
      
      const { data, error } = await supabase
        .from('calculations')
        .insert({
          user_id: userId,
          patient_id: patientId,
          weight: parseFloat(consultationData.weight || '0'),
          height: parseFloat(consultationData.height || '0'),
          age: parseInt(consultationData.age || '0'),
          bmr: consultationData.results?.tmb || 0,
          tdee: consultationData.results?.get || 0,
          protein: consultationData.results?.macros.protein || 0,
          carbs: consultationData.results?.macros.carbs || 0,
          fats: consultationData.results?.macros.fat || 0,
          gender: consultationData.sex === 'M' ? 'male' : 'female',
          activity_level: consultationData.activityLevel,
          goal: consultationData.objective
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
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
   * Save meal plan data
   */
  saveMealPlan: async (
    userId: string,
    patientId: string,
    consultationId: string,
    mealPlan: MealPlan
  ): Promise<{success: boolean, data?: any, error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      if (!userId || !patientId || !mealPlan.meals) {
        throw new Error('Missing required data for saving meal plan');
      }
      
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          patient_id: patientId,
          consultation_id: consultationId,
          meals: mealPlan.meals,
          total_calories: mealPlan.total_calories || 0,
          total_protein: mealPlan.total_protein || 0,
          total_carbs: mealPlan.total_carbs || 0,
          total_fats: mealPlan.total_fats || 0,
          date: new Date().toISOString().split('T')[0]
        })
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      return {
        success: false,
        error: error.message || 'Failed to save meal plan'
      };
    }
  },
  
  /**
   * Get consultation history for a patient
   */
  getPatientConsultations: async (patientId: string): Promise<{success: boolean, data?: any[], error?: string}> => {
    try {
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
  },
  
  /**
   * Get meal plans for a patient
   */
  getPatientMealPlans: async (patientId: string): Promise<{success: boolean, data?: MealPlan[], error?: string}> => {
    try {
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return {
        success: true,
        data: data as MealPlan[]
      };
    } catch (error: any) {
      console.error('Error getting patient meal plans:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patient meal plans'
      };
    }
  }
};
