
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanFilters, MacroTargets, MealPlanResponse, MealPlanListResponse } from '@/types/mealPlan';

export class MealPlanService {
  static async getMealPlans(userId: string, filters: MealPlanFilters = {}): Promise<MealPlan[]> {
    try {
      console.log('Fetching meal plans for user:', userId, 'with filters:', filters);
      
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.patient_id) {
        query = query.eq('patient_id', filters.patient_id);
      }

      if (filters.date_from) {
        query = query.gte('date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('date', filters.date_to);
      }

      if (filters.is_template !== undefined) {
        query = query.eq('is_template', filters.is_template);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching meal plans:', error);
        throw error;
      }

      console.log('Fetched meal plans:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getMealPlans:', error);
      throw error;
    }
  }

  static async getMealPlan(id: string): Promise<MealPlanResponse> {
    try {
      console.log('Fetching meal plan with ID:', id);
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meal plan:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Plano alimentar não encontrado' };
      }

      console.log('Fetched meal plan:', data.id);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  static async generateMealPlan(
    userId: string,
    patientId: string,
    targets: MacroTargets,
    date?: string
  ): Promise<MealPlanResponse> {
    try {
      console.log('Generating meal plan with params:', {
        userId,
        patientId,
        targets,
        date
      });

      // Validate inputs
      if (!userId || !patientId) {
        throw new Error('ID do usuário e do paciente são obrigatórios');
      }

      if (!targets.calories || targets.calories <= 0) {
        throw new Error('Meta de calorias deve ser um valor positivo');
      }

      const { data: mealPlanId, error } = await supabase.rpc(
        'generate_meal_plan_with_cultural_rules',
        {
          p_user_id: userId,
          p_patient_id: patientId,
          p_target_calories: targets.calories,
          p_target_protein: targets.protein,
          p_target_carbs: targets.carbs,
          p_target_fats: targets.fats,
          p_date: date || new Date().toISOString().split('T')[0]
        }
      );

      if (error) {
        console.error('Error generating meal plan:', error);
        throw error;
      }

      if (!mealPlanId) {
        throw new Error('Nenhum ID de plano retornado da geração');
      }

      console.log('Generated meal plan ID:', mealPlanId);

      // Fetch the complete generated meal plan
      const result = await this.getMealPlan(mealPlanId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Falha ao buscar plano gerado');
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error in generateMealPlan:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado ao gerar plano alimentar' 
      };
    }
  }

  static async createMealPlan(data: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanResponse> {
    try {
      console.log('Creating meal plan:', data);
      
      const { data: createdPlan, error } = await supabase
        .from('meal_plans')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: error.message };
      }

      console.log('Created meal plan:', createdPlan.id);
      return { success: true, data: createdPlan };
    } catch (error: any) {
      console.error('Error in createMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlanResponse> {
    try {
      console.log('Updating meal plan:', id, updates);
      
      const { data: updatedPlan, error } = await supabase
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

      console.log('Updated meal plan:', updatedPlan.id);
      return { success: true, data: updatedPlan };
    } catch (error: any) {
      console.error('Error in updateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Deleting meal plan:', id);
      
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal plan:', error);
        return { success: false, error: error.message };
      }

      console.log('Deleted meal plan:', id);
      return { success: true };
    } catch (error: any) {
      console.error('Error in deleteMealPlan:', error);
      return { success: false, error: error.message };
    }
  }
}
