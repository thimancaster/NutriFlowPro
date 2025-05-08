
// Create basic structure for mealPlanService.ts that would match the expected interface
import { supabase } from "@/integrations/supabase/client";
import { MealPlan } from "@/types";
import { dbCache } from "./dbCache";

/**
 * Service to handle meal plan-related database interactions
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
      
      if (!userId || !patientId || !mealPlan) {
        throw new Error('Missing required data for saving meal plan');
      }
      
      // Convert the meal plan to the database format
      const dbMealPlan = {
        user_id: userId,
        patient_id: patientId,
        date: new Date().toISOString().split('T')[0],
        meals: mealPlan.meals || [],
        total_calories: mealPlan.calories || 0,
        total_protein: mealPlan.protein || 0,
        total_carbs: mealPlan.carbs || 0,
        total_fats: mealPlan.fat || 0
      };
      
      // Check if we're updating an existing plan or creating a new one
      let result;
      if (mealPlan.id) {
        const { data, error } = await supabase
          .from('meal_plans')
          .update(dbMealPlan)
          .eq('id', mealPlan.id)
          .select('*')
          .single();
          
        if (error) throw error;
        result = { data, error };
      } else {
        const { data, error } = await supabase
          .from('meal_plans')
          .insert(dbMealPlan)
          .select('*')
          .single();
          
        if (error) throw error;
        result = { data, error };
      }
      
      // Invalidate meal plans cache for this patient
      dbCache.invalidate(`${dbCache.KEYS.MEAL_PLANS}${patientId}`);
      
      // Map the database response back to our MealPlan type
      const adaptedMealPlan: MealPlan = {
        id: result.data.id,
        name: mealPlan.name || `Plano Alimentar - ${new Date().toLocaleDateString()}`,
        patient_id: result.data.patient_id,
        calories: result.data.total_calories,
        protein: result.data.total_protein,
        carbs: result.data.total_carbs,
        fat: result.data.total_fats,
        mealDistribution: mealPlan.mealDistribution || [],
        meals: result.data.meals || []
      };
      
      return {
        success: true,
        data: adaptedMealPlan
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
   * Get meal plans for a patient
   */
  getPatientMealPlans: async (
    patientId: string
  ): Promise<{success: boolean, data?: MealPlan[], error?: string}> => {
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
      
      // Map database records to MealPlan type with proper type casting
      const mealPlans: MealPlan[] = data.map(item => ({
        id: item.id,
        name: `Plano Alimentar - ${new Date(item.date).toLocaleDateString()}`,
        patient_id: item.patient_id,
        calories: item.total_calories,
        protein: item.total_protein,
        carbs: item.total_carbs,
        fat: item.total_fats,
        mealDistribution: [],
        meals: Array.isArray(item.meals) ? item.meals : [] // Fix: Ensure meals is always an array
      }));
      
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
