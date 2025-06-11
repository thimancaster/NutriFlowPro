import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanItem, DetailedMealPlan, MealPlanFilters, MealPlanMeal } from '@/types/mealPlan';

export class MealPlanService {
  /**
   * Criar um novo plano alimentar
   */
  static async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<{
    success: boolean;
    data?: MealPlan;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .insert({
          ...mealPlan,
          meals: JSON.stringify(mealPlan.meals || [])
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { 
        success: true, 
        data: {
          ...data,
          meals: typeof data.meals === 'string' ? JSON.parse(data.meals) : data.meals
        } as MealPlan
      };
    } catch (error: any) {
      console.error('Erro ao criar plano alimentar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get meal plans with filters
   */
  static async getMealPlans(userId: string, filters: MealPlanFilters = {}): Promise<MealPlan[]> {
    try {
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId);

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

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(plan => ({
        ...plan,
        meals: typeof plan.meals === 'string' ? JSON.parse(plan.meals) : plan.meals
      })) as MealPlan[];
    } catch (error) {
      console.error('Erro ao buscar planos alimentares:', error);
      return [];
    }
  }

  /**
   * Get meal plan by ID
   */
  static async getMealPlan(id: string): Promise<MealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        meals: typeof data.meals === 'string' ? JSON.parse(data.meals) : data.meals
      } as MealPlan;
    } catch (error) {
      console.error('Erro ao buscar plano alimentar:', error);
      return null;
    }
  }

  /**
   * Delete meal plan
   */
  static async deleteMealPlan(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar plano alimentar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualizar plano alimentar
   */
  static async updateMealPlan(id: string, updates: Partial<DetailedMealPlan>): Promise<{
    success: boolean;
    data?: DetailedMealPlan;
    error?: string;
  }> {
    try {
      // Preparar dados para atualização
      const updateData: any = { ...updates };
      
      if (updates.meals) {
        updateData.meals = JSON.stringify(updates.meals);
      }

      // Remover campos que não devem ser atualizados diretamente
      delete updateData.items;
      delete updateData.id;
      delete updateData.created_at;

      const { data, error } = await supabase
        .from('meal_plans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Se há itens para atualizar, fazer isso separadamente
      if (updates.items) {
        await this.updateMealPlanItems(id, updates.items);
      }

      // Buscar o plano atualizado com itens
      const updatedPlan = await this.getMealPlanById(id);
      
      return { success: true, data: updatedPlan };
    } catch (error: any) {
      console.error('Erro ao atualizar plano alimentar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar plano alimentar por ID com itens
   */
  static async getMealPlanById(id: string): Promise<DetailedMealPlan | null> {
    try {
      const { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) {
        throw planError;
      }

      const { data: items, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', id)
        .order('meal_type, order_index');

      if (itemsError) {
        throw itemsError;
      }

      return {
        ...mealPlan,
        meals: typeof mealPlan.meals === 'string' ? JSON.parse(mealPlan.meals) : mealPlan.meals,
        items: items || []
      } as DetailedMealPlan;
    } catch (error) {
      console.error('Erro ao buscar plano alimentar:', error);
      return null;
    }
  }

  /**
   * Atualizar itens do plano alimentar
   */
  static async updateMealPlanItems(mealPlanId: string, items: MealPlanItem[]): Promise<void> {
    try {
      // Primeiro, deletar todos os itens existentes
      await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', mealPlanId);

      // Inserir novos itens
      if (items.length > 0) {
        const { error } = await supabase
          .from('meal_plan_items')
          .insert(items.map(item => ({
            ...item,
            meal_plan_id: mealPlanId
          })));

        if (error) {
          throw error;
        }
      }

      // Recalcular totais do plano
      await this.recalculateMealPlanTotals(mealPlanId);
    } catch (error) {
      console.error('Erro ao atualizar itens do plano alimentar:', error);
      throw error;
    }
  }

  /**
   * Adicionar item ao plano alimentar
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

      if (error) {
        throw error;
      }

      // Recalcular totais
      await this.recalculateMealPlanTotals(item.meal_plan_id);

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao adicionar item ao plano:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualizar item do plano alimentar
   */
  static async updateMealPlanItem(id: string, updates: Partial<MealPlanItem>): Promise<{
    success: boolean;
    data?: MealPlanItem;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Recalcular totais
      if (data) {
        await this.recalculateMealPlanTotals(data.meal_plan_id);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Erro ao atualizar item do plano:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remover item do plano alimentar
   */
  static async removeMealPlanItem(id: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Primeiro buscar o item para saber o meal_plan_id
      const { data: item } = await supabase
        .from('meal_plan_items')
        .select('meal_plan_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('meal_plan_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Recalcular totais
      if (item) {
        await this.recalculateMealPlanTotals(item.meal_plan_id);
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao remover item do plano:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Recalcular totais do plano alimentar
   */
  static async recalculateMealPlanTotals(mealPlanId: string): Promise<void> {
    try {
      const { data: items } = await supabase
        .from('meal_plan_items')
        .select('calories, protein, carbs, fats')
        .eq('meal_plan_id', mealPlanId);

      if (!items) return;

      const totals = items.reduce((acc, item) => ({
        total_calories: acc.total_calories + (item.calories || 0),
        total_protein: acc.total_protein + (item.protein || 0),
        total_carbs: acc.total_carbs + (item.carbs || 0),
        total_fats: acc.total_fats + (item.fats || 0)
      }), {
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fats: 0
      });

      await supabase
        .from('meal_plans')
        .update(totals)
        .eq('id', mealPlanId);
    } catch (error) {
      console.error('Erro ao recalcular totais do plano:', error);
    }
  }

  /**
   * Gerar plano alimentar automaticamente
   */
  static async generateMealPlan(
    userId: string,
    patientId: string,
    targets: { calories: number; protein: number; carbs: number; fats: number },
    date?: string
  ): Promise<{
    success: boolean;
    data?: DetailedMealPlan;
    error?: string;
  }> {
    try {
      // Usar a função do banco para gerar o plano
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: userId,
        p_patient_id: patientId,
        p_target_calories: targets.calories,
        p_target_protein: targets.protein,
        p_target_carbs: targets.carbs,
        p_target_fats: targets.fats,
        p_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        throw error;
      }

      // Buscar o plano gerado
      const generatedPlan = await this.getMealPlanById(data);
      
      return { success: true, data: generatedPlan };
    } catch (error: any) {
      console.error('Erro ao gerar plano alimentar:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export a default instance for backward compatibility
export const mealPlanService = MealPlanService;
