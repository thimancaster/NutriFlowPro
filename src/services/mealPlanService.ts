
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan, MealPlanGenerationParams, MealPlanGenerationResult } from '@/types/mealPlanTypes';
import { DetailedMealPlan, MealPlanListResponse, MealPlanMeal } from '@/types/mealPlan';

export const MealPlanService = {
  async createMealPlan(params: MealPlanGenerationParams): Promise<MealPlanGenerationResult> {
    try {
      const mealPlanData = {
        user_id: params.userId,
        patient_id: params.patientId,
        date: params.date || new Date().toISOString().split('T')[0],
        total_calories: params.totalCalories,
        total_protein: params.totalProtein,
        total_carbs: params.totalCarbs,
        total_fats: params.totalFats,
        meals: [] // Convert from ConsolidatedMeal[] to proper format
      };

      const { data, error } = await supabase
        .from('meal_plans')
        .insert(mealPlanData)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data: data as ConsolidatedMealPlan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getMealPlan(id: string): Promise<ConsolidatedMealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ConsolidatedMealPlan;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }
  },

  async getMealPlanById(id: string): Promise<DetailedMealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Convert ConsolidatedMealPlan to DetailedMealPlan format
      const mealPlan = data as ConsolidatedMealPlan;
      const detailedMealPlan: DetailedMealPlan = {
        ...mealPlan,
        meals: mealPlan.meals?.map(meal => ({
          ...meal,
          foods: meal.items?.map(item => ({
            id: item.id,
            food_id: item.food_id,
            name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats
          })) || []
        })) || []
      };

      return detailedMealPlan;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }
  },

  async getMealPlans(userId: string, filters?: { patient_id?: string }): Promise<MealPlanListResponse> {
    try {
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.patient_id) {
        query = query.eq('patient_id', filters.patient_id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Convert to DetailedMealPlan format
      const detailedPlans: DetailedMealPlan[] = (data as ConsolidatedMealPlan[]).map(plan => ({
        ...plan,
        meals: plan.meals?.map(meal => ({
          ...meal,
          foods: meal.items?.map(item => ({
            id: item.id,
            food_id: item.food_id,
            name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats
          })) || []
        })) || []
      }));

      return { success: true, data: detailedPlans };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async updateMealPlan(id: string, updates: Partial<ConsolidatedMealPlan>): Promise<MealPlanGenerationResult> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, data: data as ConsolidatedMealPlan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
