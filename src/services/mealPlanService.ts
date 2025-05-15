
import { supabase } from '@/integrations/supabase/client';
import { MealPlan } from '@/types/meal';
import { format } from 'date-fns';

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
  async createMealPlan(consultationId: string, mealPlanData: MealPlan) {
    try {
      // Format date for Supabase
      const formattedDate = typeof mealPlanData.date === 'string' 
        ? mealPlanData.date 
        : format(mealPlanData.date, 'yyyy-MM-dd');
      
      // Prepare meal plan data for database
      const dbMealPlan = {
        id: mealPlanData.id,
        user_id: mealPlanData.user_id,
        patient_id: mealPlanData.patient_id,
        date: formattedDate,
        meals: JSON.stringify(mealPlanData.meals),
        total_calories: mealPlanData.total_calories,
        total_protein: mealPlanData.total_protein,
        total_carbs: mealPlanData.total_carbs,
        total_fats: mealPlanData.total_fats
      };

      // Add consultation_id as a custom field in the query
      const { data, error } = await supabase
        .from('meal_plans')
        .insert([{ ...dbMealPlan, consultation_id: consultationId }])
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
      // Format date for Supabase if present
      const formattedData: any = { ...mealPlanData };
      
      if (formattedData.date) {
        formattedData.date = typeof formattedData.date === 'string' 
          ? formattedData.date 
          : format(formattedData.date, 'yyyy-MM-dd');
      }
      
      if (formattedData.meals) {
        formattedData.meals = JSON.stringify(formattedData.meals);
      }
      
      const { data, error } = await supabase
        .from('meal_plans')
        .update(formattedData)
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
