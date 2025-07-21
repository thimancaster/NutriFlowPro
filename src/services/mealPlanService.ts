
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanFilters, MacroTargets, MealPlanResponse, MealPlanListResponse, MealPlanMeal } from '@/types/mealPlan';

// Helper function to parse JSON meals safely
const parseMeals = (meals: any): MealPlanMeal[] => {
  if (Array.isArray(meals)) return meals;
  if (typeof meals === 'string') {
    try {
      return JSON.parse(meals);
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to convert database row to MealPlan
const convertToMealPlan = (row: any): MealPlan => {
  return {
    id: row.id,
    user_id: row.user_id,
    patient_id: row.patient_id,
    calculation_id: row.calculation_id,
    date: row.date,
    meals: parseMeals(row.meals),
    total_calories: row.total_calories,
    total_protein: row.total_protein,
    total_carbs: row.total_carbs,
    total_fats: row.total_fats,
    notes: row.notes,
    is_template: row.is_template,
    day_of_week: row.day_of_week,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
};

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
      return data ? data.map(convertToMealPlan) : [];
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
      return { success: true, data: convertToMealPlan(data) };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  // Alias for compatibility
  static async getMealPlanById(id: string): Promise<MealPlan | null> {
    const result = await this.getMealPlan(id);
    return result.success ? result.data! : null;
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
      
      // Convert MealPlan to database format
      const dbData = {
        user_id: data.user_id,
        patient_id: data.patient_id,
        calculation_id: data.calculation_id,
        date: data.date,
        meals: JSON.stringify(data.meals),
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        notes: data.notes,
        is_template: data.is_template,
        day_of_week: data.day_of_week
      };
      
      const { data: createdPlan, error } = await supabase
        .from('meal_plans')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: error.message };
      }

      console.log('Created meal plan:', createdPlan.id);
      return { success: true, data: convertToMealPlan(createdPlan) };
    } catch (error: any) {
      console.error('Error in createMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlanResponse> {
    try {
      console.log('Updating meal plan:', id, updates);
      
      // Convert updates to database format
      const dbUpdates: any = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      // Convert meals array to JSON string if present
      if (updates.meals) {
        dbUpdates.meals = JSON.stringify(updates.meals);
      }
      
      const { data: updatedPlan, error } = await supabase
        .from('meal_plans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        return { success: false, error: error.message };
      }

      console.log('Updated meal plan:', updatedPlan.id);
      return { success: true, data: convertToMealPlan(updatedPlan) };
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
