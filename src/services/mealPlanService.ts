
import { supabase } from '@/integrations/supabase/client';
import { MealPlan } from '@/types';

export const MealPlanService = {
  /**
   * Fetch meal plans for a specific patient or all patients
   */
  async getMealPlans(patientId?: string) {
    try {
      let query = supabase
        .from('meal_plans')
        .select('*, patients(name)')
        .order('created_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Format the data to include patient name
      const formattedData = data.map((mealPlan) => ({
        ...mealPlan,
        patientName: mealPlan.patients?.name || 'Unknown',
      }));
      
      return { success: true, data: formattedData };
    } catch (error: any) {
      console.error('Error fetching meal plans:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Get a specific meal plan by ID
   */
  async getMealPlan(id: string) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*, patients(name)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return { success: true, data: {
        ...data,
        patientName: data.patients?.name || 'Unknown',
      }};
    } catch (error: any) {
      console.error('Error fetching meal plan:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Create a new meal plan
   */
  async createMealPlan(consultationId: string, mealPlanData: Partial<MealPlan>) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{
          ...mealPlanData,
          consultation_id: consultationId,
        }])
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating meal plan:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Update an existing meal plan
   */
  async updateMealPlan(id: string, mealPlanData: Partial<MealPlan>) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(mealPlanData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Delete a meal plan
   */
  async deleteMealPlan(id: string) {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting meal plan:', error);
      return { success: false, error: error.message };
    }
  }
};
