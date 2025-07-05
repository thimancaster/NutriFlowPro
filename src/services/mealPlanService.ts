
import { supabase } from '@/integrations/supabase/client';
import { 
  MealPlan, 
  MealPlanResponse, 
  MealPlanListResponse, 
  MacroTargets,
  MealPlanMeal,
  DetailedMealPlan,
  MEAL_NAMES,
  MEAL_ORDER 
} from '@/types/mealPlan';

export class MealPlanService {
  // Converter Json para MealPlanMeal[]
  private static convertJsonToMeals(mealsJson: any): MealPlanMeal[] {
    if (!mealsJson || !Array.isArray(mealsJson)) return [];
    
    return mealsJson.map((meal: any) => ({
      id: meal.id || '',
      type: meal.type || 'cafe_da_manha',
      name: meal.name || '',
      foods: meal.foods || [],
      total_calories: meal.total_calories || 0,
      total_protein: meal.total_protein || 0,
      total_carbs: meal.total_carbs || 0,
      total_fats: meal.total_fats || 0,
      notes: meal.notes
    }));
  }

  // Converter MealPlan de Supabase para nossa interface
  private static convertSupabaseMealPlan(data: any): MealPlan {
    return {
      id: data.id,
      user_id: data.user_id,
      patient_id: data.patient_id,
      calculation_id: data.calculation_id,
      date: data.date,
      meals: this.convertJsonToMeals(data.meals),
      total_calories: data.total_calories,
      total_protein: data.total_protein,
      total_carbs: data.total_carbs,
      total_fats: data.total_fats,
      notes: data.notes,
      is_template: data.is_template,
      day_of_week: data.day_of_week,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }

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

      return { success: true, data: this.convertSupabaseMealPlan(data) };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para compatibilidade com código existente
  static async getMealPlanById(id: string): Promise<DetailedMealPlan | null> {
    try {
      const result = await this.getMealPlan(id);
      if (result.success && result.data) {
        return result.data as DetailedMealPlan;
      }
      return null;
    } catch (error) {
      console.error('Error in getMealPlanById:', error);
      return null;
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

      const convertedData = data?.map(item => this.convertSupabaseMealPlan(item)) || [];

      return { 
        success: true, 
        data: convertedData, 
        total: count || convertedData.length 
      };
    } catch (error: any) {
      console.error('Error in listMealPlans:', error);
      return { success: false, error: error.message };
    }
  }

  // Método para compatibilidade
  static async getMealPlans(userId: string, filters?: any): Promise<MealPlan[]> {
    try {
      const result = await this.listMealPlans(userId, filters?.patient_id);
      return result.data || [];
    } catch (error) {
      console.error('Error in getMealPlans:', error);
      return [];
    }
  }

  // Criar plano alimentar
  static async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          user_id: mealPlan.user_id,
          patient_id: mealPlan.patient_id,
          calculation_id: mealPlan.calculation_id,
          date: mealPlan.date,
          meals: mealPlan.meals as any, // Supabase expects Json type
          total_calories: mealPlan.total_calories,
          total_protein: mealPlan.total_protein,
          total_carbs: mealPlan.total_carbs,
          total_fats: mealPlan.total_fats,
          notes: mealPlan.notes,
          is_template: mealPlan.is_template,
          day_of_week: mealPlan.day_of_week
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: this.convertSupabaseMealPlan(data) };
    } catch (error: any) {
      console.error('Error in createMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar plano alimentar
  static async updateMealPlan(
    id: string,
    updates: Partial<MealPlan>
  ): Promise<MealPlanResponse> {
    try {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Converter meals para Json se necessário
      if (updates.meals) {
        updateData.meals = updates.meals as any;
      }

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: this.convertSupabaseMealPlan(data) };
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
