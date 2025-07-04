
import { supabase } from '@/integrations/supabase/client';
import { 
  MealPlan, 
  MealPlanResponse, 
  MealPlanListResponse, 
  MacroTargets,
  MEAL_NAMES,
  MEAL_ORDER 
} from '@/types/mealPlan';

export class MealPlanService {
  // Gerar plano alimentar com inteligência cultural brasileira
  static async generateMealPlan(
    userId: string,
    patientId: string,
    targets: MacroTargets,
    date?: string
  ): Promise<MealPlanResponse> {
    try {
      console.log('Generating culturally intelligent meal plan...');
      
      const targetDate = date || new Date().toISOString().split('T')[0];

      // Usar a nova função com inteligência cultural
      const { data: mealPlanId, error } = await supabase.rpc(
        'generate_meal_plan_with_cultural_rules',
        {
          p_user_id: userId,
          p_patient_id: patientId,
          p_target_calories: targets.calories,
          p_target_protein: targets.protein,
          p_target_carbs: targets.carbs,
          p_target_fats: targets.fats,
          p_date: targetDate
        }
      );

      if (error) {
        console.error('Error calling generate_meal_plan_with_cultural_rules:', error);
        return { success: false, error: error.message };
      }

      if (!mealPlanId) {
        return { success: false, error: 'No meal plan ID returned' };
      }

      // Buscar o plano gerado
      const mealPlan = await this.getMealPlan(mealPlanId);
      
      if (mealPlan.success && mealPlan.data) {
        console.log('Successfully generated culturally intelligent meal plan');
        return mealPlan;
      } else {
        return { success: false, error: 'Failed to fetch generated meal plan' };
      }

    } catch (error: any) {
      console.error('Error in generateMealPlan:', error);
      return { success: false, error: error.message || 'Erro inesperado' };
    }
  }

  // Buscar plano alimentar por ID
  static async getMealPlan(id: string): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items:meal_plan_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meal plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as MealPlan };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar planos alimentares
  static async listMealPlans(
    userId: string,
    patientId?: string,
    limit: number = 20
  ): Promise<MealPlanListResponse> {
    try {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items:meal_plan_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error listing meal plans:', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data as MealPlan[], 
        total: count || data?.length || 0 
      };
    } catch (error: any) {
      console.error('Error in listMealPlans:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar plano alimentar
  static async updateMealPlan(
    id: string,
    updates: Partial<MealPlan>
  ): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as MealPlan };
    } catch (error: any) {
      console.error('Error in updateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar plano alimentar
  static async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteMealPlan:', error);
      return { success: false, error: error.message };
    }
  }
}
