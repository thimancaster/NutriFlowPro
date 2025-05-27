
import { supabase } from '@/integrations/supabase/client';
import { DetailedMealPlan, MealPlanItem, MealPlanGenerationParams } from '@/types/mealPlan';

export class EnhancedMealPlanService {
  /**
   * Gera um plano alimentar automático usando a função do banco
   */
  static async generateAutoMealPlan(params: MealPlanGenerationParams): Promise<{
    success: boolean;
    data?: DetailedMealPlan;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: params.userId,
        p_patient_id: params.patientId,
        p_target_calories: params.targets.calories,
        p_target_protein: params.targets.protein,
        p_target_carbs: params.targets.carbs,
        p_target_fats: params.targets.fats,
        p_date: params.date || new Date().toISOString().split('T')[0]
      });

      if (error) throw error;

      // Buscar o plano completo com os itens
      const fullPlan = await this.getMealPlanWithItems(data);
      
      return {
        success: true,
        data: fullPlan.data
      };
    } catch (error: any) {
      console.error('Error generating auto meal plan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca um plano alimentar com todos os seus itens
   */
  static async getMealPlanWithItems(planId: string): Promise<{
    success: boolean;
    data?: DetailedMealPlan;
    error?: string;
  }> {
    try {
      // Buscar o plano
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // Buscar os itens do plano
      const { data: items, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', planId)
        .order('meal_type, order_index');

      if (itemsError) throw itemsError;

      // Type assertion para garantir que meal_type está correto
      const typedItems: MealPlanItem[] = (items || []).map(item => ({
        ...item,
        meal_type: item.meal_type as MealPlanItem['meal_type']
      }));

      const detailedPlan: DetailedMealPlan = {
        ...plan,
        items: typedItems
      };

      return {
        success: true,
        data: detailedPlan
      };
    } catch (error: any) {
      console.error('Error fetching meal plan with items:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Adiciona um item ao plano alimentar
   */
  static async addMealPlanItem(item: Omit<MealPlanItem, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    data?: MealPlanItem;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      // Type assertion para garantir que meal_type está correto
      const typedItem: MealPlanItem = {
        ...data,
        meal_type: data.meal_type as MealPlanItem['meal_type']
      };

      return {
        success: true,
        data: typedItem
      };
    } catch (error: any) {
      console.error('Error adding meal plan item:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Remove um item do plano alimentar
   */
  static async removeMealPlanItem(itemId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error removing meal plan item:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Atualiza um item do plano alimentar
   */
  static async updateMealPlanItem(itemId: string, updates: Partial<MealPlanItem>): Promise<{
    success: boolean;
    data?: MealPlanItem;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      // Type assertion para garantir que meal_type está correto
      const typedItem: MealPlanItem = {
        ...data,
        meal_type: data.meal_type as MealPlanItem['meal_type']
      };

      return {
        success: true,
        data: typedItem
      };
    } catch (error: any) {
      console.error('Error updating meal plan item:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca planos alimentares de um paciente
   */
  static async getPatientMealPlans(patientId: string, userId: string): Promise<{
    success: boolean;
    data?: DetailedMealPlan[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      console.error('Error fetching patient meal plans:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Busca alimentos disponíveis para adicionar ao plano
   */
  static async searchFoods(query: string, mealType?: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      let queryBuilder = supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`);

      if (mealType) {
        queryBuilder = queryBuilder.contains('meal_time', [mealType]);
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) throw error;

      return {
        success: true,
        data: data || []
      };
    } catch (error: any) {
      console.error('Error searching foods:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
