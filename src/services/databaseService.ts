
import { supabase } from "@/integrations/supabase/client";
import { MealPlan, Patient, ConsultationData } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { storageUtils } from "@/utils/storageUtils";

// Constants for optimized caching
const CACHE_KEYS = {
  PATIENT: 'db_patient_',
  CONSULTATIONS: 'db_consultations_',
  MEAL_PLANS: 'db_meal_plans_'
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Utility functions for managing database operation cache
 */
const dbCache = {
  get: <T>(key: string): { data: T, timestamp: number } | null => {
    const cachedData = storageUtils.getSessionItem<{ data: T, timestamp: number }>(key);
    if (!cachedData) return null;
    
    // Check if cache is still valid
    if (Date.now() - cachedData.timestamp > CACHE_TTL) {
      storageUtils.removeSessionItem(key);
      return null;
    }
    
    return cachedData;
  },
  
  set: <T>(key: string, data: T): void => {
    storageUtils.setSessionItem(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  invalidate: (keyPrefix: string, id?: string): void => {
    if (id) {
      // Invalidate specific cache entry
      storageUtils.removeSessionItem(`${keyPrefix}${id}`);
    } else {
      // Find and remove all cache entries with this prefix
      // Since we can't enumerate sessionStorage, we'll focus on known keys
      Object.values(CACHE_KEYS).forEach(key => {
        if (key.startsWith(keyPrefix)) {
          storageUtils.removeSessionItem(key);
        }
      });
    }
  }
};

/**
 * Service to handle all database interactions with optimized caching
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
        user_id: userId,
        name: patient.name // Explicitly include name to satisfy TypeScript
      };
      
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      // Invalidate related caches
      if (data?.id) {
        dbCache.set(`${CACHE_KEYS.PATIENT}${data.id}`, data);
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
   * Get a patient by ID with optimized caching
   */
  getPatient: async (patientId: string): Promise<{success: boolean, data?: Patient, error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cachedData = dbCache.get<Patient>(`${CACHE_KEYS.PATIENT}${patientId}`);
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
      dbCache.set(`${CACHE_KEYS.PATIENT}${patientId}`, data);
      
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
      
      // Invalidate consultations cache for this patient
      dbCache.invalidate(`${CACHE_KEYS.CONSULTATIONS}${patientId}`);
      
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
      
      // Convert MealData[] to Json before inserting
      const mealsAsJson = JSON.parse(JSON.stringify(mealPlan.meals)) as Json;
      
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: userId,
          patient_id: patientId,
          consultation_id: consultationId,
          meals: mealsAsJson,
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
      
      // Invalidate meal plans cache for this patient
      dbCache.invalidate(`${CACHE_KEYS.MEAL_PLANS}${patientId}`);
      
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
   * Get consultation history for a patient with caching
   */
  getPatientConsultations: async (patientId: string): Promise<{success: boolean, data?: any[], error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.CONSULTATIONS}${patientId}`;
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
  },
  
  /**
   * Get meal plans for a patient with caching
   */
  getPatientMealPlans: async (patientId: string): Promise<{success: boolean, data?: MealPlan[], error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cacheKey = `${CACHE_KEYS.MEAL_PLANS}${patientId}`;
      const cachedData = dbCache.get<MealPlan[]>(cacheKey);
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
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Transform data to match MealPlan type
      const mealPlans: MealPlan[] = data?.map(item => {
        // Convert Json meals back to MealData[]
        const meals = item.meals as unknown as MealPlan['meals'];
        
        return {
          id: item.id,
          user_id: item.user_id,
          patient_id: item.patient_id,
          date: item.date,
          meals: meals,
          total_calories: item.total_calories,
          total_protein: item.total_protein,
          total_carbs: item.total_carbs,
          total_fats: item.total_fats,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
      }) || [];
      
      // Save to cache
      dbCache.set(cacheKey, mealPlans);
      
      return {
        success: true,
        data: mealPlans
      };
    } catch (error: any) {
      console.error('Error getting patient meal plans:', error);
      return {
        success: false,
        error: error.message || 'Failed to get patient meal plans'
      };
    }
  },
  
  /**
   * Clear all database service caches
   */
  clearCache: (): void => {
    Object.values(CACHE_KEYS).forEach(keyPrefix => {
      dbCache.invalidate(keyPrefix);
    });
  }
};
