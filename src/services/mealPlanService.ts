
import { supabase } from "@/integrations/supabase/client";
import { MealPlan } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { dbCache } from "./dbCache";
import { ConsultationService } from "./consultationService";

/**
 * Service to handle meal plan related database interactions
 */
export const MealPlanService = {
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
      dbCache.invalidate(`${dbCache.KEYS.MEAL_PLANS}${patientId}`);
      
      // After saving meal plan, mark consultation as complete
      try {
        await ConsultationService.updateConsultationStatus(consultationId, 'completo');
      } catch (err) {
        console.warn('Could not update consultation status after saving meal plan', err);
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
   * Get meal plans for a patient with caching
   */
  getPatientMealPlans: async (patientId: string): Promise<{success: boolean, data?: MealPlan[], error?: string}> => {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      
      // Check cache first
      const cacheKey = `${dbCache.KEYS.MEAL_PLANS}${patientId}`;
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
  }
};
