
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan, MealPlanGenerationParams, MealPlanGenerationResult } from '@/types/mealPlanTypes';
import { DetailedMealPlan, MealPlanListResponse, MealPlanMeal } from '@/types/mealPlan';
import { MealPlanServiceV3 } from './mealPlan/MealPlanServiceV3';

export const MealPlanService = {
  async createMealPlan(params: MealPlanGenerationParams): Promise<MealPlanGenerationResult> {
    return MealPlanServiceV3.generateMealPlan(params);
  },

  async generateMealPlan(
    userId: string,
    patientId: string,
    targets: { calories: number; protein: number; carbs: number; fats: number },
    date?: string
  ): Promise<MealPlanGenerationResult> {
    const params: MealPlanGenerationParams = {
      userId,
      patientId,
      totalCalories: targets.calories,
      totalProtein: targets.protein,
      totalCarbs: targets.carbs,
      totalFats: targets.fats,
      date
    };
    return MealPlanServiceV3.generateMealPlan(params);
  },

  async getMealPlan(id: string): Promise<ConsolidatedMealPlan | null> {
    const result = await MealPlanServiceV3.getMealPlanById(id);
    return result.success ? result.data || null : null;
  },

  async getMealPlanById(id: string): Promise<DetailedMealPlan | null> {
    try {
      const result = await MealPlanServiceV3.getMealPlanById(id);
      
      if (!result.success || !result.data) {
        return null;
      }

      const mealPlan = result.data;
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
      const result = await MealPlanServiceV3.listMealPlans(userId, filters?.patient_id);

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const detailedPlans: DetailedMealPlan[] = result.data.map(plan => ({
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
    return MealPlanServiceV3.updateMealPlan(id, updates);
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
