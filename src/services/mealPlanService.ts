
import { supabase } from '@/integrations/supabase/client';
import { 
  MealPlan, 
  MealPlanItem, 
  MealPlanFilters, 
  MealPlanResponse, 
  MealPlanListResponse,
  MacroTargets,
  DetailedMealPlan 
} from '@/types/mealPlan';

export class MealPlanService {
  /**
   * Get meal plans with optional filters
   */
  static async getMealPlans(
    userId: string, 
    filters: MealPlanFilters = {}
  ): Promise<MealPlanListResponse> {
    try {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            id,
            meal_plan_id,
            meal_type,
            food_id,
            food_name,
            quantity,
            unit,
            calories,
            protein,
            carbs,
            fats,
            order_index
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      // Apply filters
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
        return { success: false, error: error.message };
      }

      // Transform data to match MealPlan interface with proper MealPlanItem structure
      const transformedData = data?.map(plan => {
        const items = (plan.meal_plan_items || []).map((item: any) => ({
          id: item.id,
          meal_plan_id: item.meal_plan_id || plan.id,
          meal_type: item.meal_type,
          food_id: item.food_id,
          food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          order_index: item.order_index
        })) as MealPlanItem[];

        return {
          ...plan,
          meals: this.groupItemsByMealType(items)
        };
      }) || [];

      return { 
        success: true, 
        data: transformedData as MealPlan[],
        total: transformedData.length 
      };
    } catch (error: any) {
      console.error('Error in getMealPlans:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a single meal plan by ID
   */
  static async getMealPlan(id: string): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meal plan:', error);
        return { success: false, error: error.message };
      }

      // Transform data with proper MealPlanItem structure
      const items = (data.meal_plan_items || []).map((item: any) => ({
        id: item.id,
        meal_plan_id: item.meal_plan_id || data.id,
        meal_type: item.meal_type,
        food_id: item.food_id,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        order_index: item.order_index
      })) as MealPlanItem[];

      const transformedData = {
        ...data,
        meals: this.groupItemsByMealType(items)
      };

      return { success: true, data: transformedData as MealPlan };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get meal plan by ID (legacy method)
   */
  static async getMealPlanById(id: string, userId: string): Promise<MealPlanResponse> {
    return this.getMealPlan(id);
  }

  /**
   * Get patient meal plans (legacy method)
   */
  static async getPatientMealPlans(patientId: string, userId: string): Promise<MealPlanListResponse> {
    return this.getMealPlans(userId, { patient_id: patientId });
  }

  /**
   * Save meal plan (legacy method)
   */
  static async saveMealPlan(mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanResponse> {
    return this.createMealPlan(mealPlanData);
  }

  /**
   * Create a new meal plan
   */
  static async createMealPlan(
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MealPlanResponse> {
    try {
      // First create the meal plan
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: mealPlanData.user_id,
          patient_id: mealPlanData.patient_id,
          calculation_id: mealPlanData.calculation_id,
          date: mealPlanData.date,
          total_calories: mealPlanData.total_calories,
          total_protein: mealPlanData.total_protein,
          total_carbs: mealPlanData.total_carbs,
          total_fats: mealPlanData.total_fats,
          notes: mealPlanData.notes,
          is_template: mealPlanData.is_template,
          day_of_week: mealPlanData.day_of_week,
          meals: '[]'
        })
        .select()
        .single();

      if (mealPlanError) {
        console.error('Error creating meal plan:', mealPlanError);
        return { success: false, error: mealPlanError.message };
      }

      // Create meal plan items if meals are provided
      if (mealPlanData.meals && mealPlanData.meals.length > 0) {
        const items = this.flattenMealsToItems(mealPlan.id, mealPlanData.meals);
        
        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(items);

        if (itemsError) {
          console.error('Error creating meal plan items:', itemsError);
          // Try to cleanup the meal plan
          await supabase.from('meal_plans').delete().eq('id', mealPlan.id);
          return { success: false, error: itemsError.message };
        }
      }

      return { success: true, data: { ...mealPlan, meals: mealPlanData.meals } as MealPlan };
    } catch (error: any) {
      console.error('Error in createMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a meal plan
   */
  static async updateMealPlan(
    id: string, 
    updates: Partial<MealPlan>
  ): Promise<MealPlanResponse> {
    try {
      // Update meal plan basic data
      const { data: mealPlan, error: updateError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fats: updates.total_fats,
          notes: updates.notes,
          is_template: updates.is_template,
          day_of_week: updates.day_of_week
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating meal plan:', updateError);
        return { success: false, error: updateError.message };
      }

      // If meals are being updated, replace all items
      if (updates.meals) {
        // Delete existing items
        await supabase
          .from('meal_plan_items')
          .delete()
          .eq('meal_plan_id', id);

        // Insert new items
        const items = this.flattenMealsToItems(id, updates.meals);
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(items);

          if (itemsError) {
            console.error('Error updating meal plan items:', itemsError);
            return { success: false, error: itemsError.message };
          }
        }
      }

      return { success: true, data: { ...mealPlan, meals: updates.meals || [] } as MealPlan };
    } catch (error: any) {
      console.error('Error in updateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a meal plan
   */
  static async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Delete items first (cascade should handle this, but being explicit)
      await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', id);

      // Delete meal plan
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

  /**
   * Generate meal plan using database function
   */
  static async generateMealPlan(
    userId: string,
    patientId: string,
    targets: MacroTargets,
    date: string = new Date().toISOString().split('T')[0]
  ): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: userId,
        p_patient_id: patientId,
        p_target_calories: targets.calories,
        p_target_protein: targets.protein,
        p_target_carbs: targets.carbs,
        p_target_fats: targets.fats,
        p_date: date
      });

      if (error) {
        console.error('Error generating meal plan:', error);
        return { success: false, error: error.message };
      }

      // Fetch the generated meal plan
      return this.getMealPlan(data);
    } catch (error: any) {
      console.error('Error in generateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper method to group meal plan items by meal type
   */
  private static groupItemsByMealType(items: MealPlanItem[]) {
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.meal_type]) {
        acc[item.meal_type] = [];
      }
      acc[item.meal_type].push({
        id: item.id,
        food_id: item.food_id || '',
        name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        order_index: item.order_index
      });
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(grouped).map(([type, foods]) => ({
      id: `${type}-meal`,
      type: type as 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack',
      name: this.getMealTypeName(type),
      foods,
      total_calories: foods.reduce((sum, food) => sum + food.calories, 0),
      total_protein: foods.reduce((sum, food) => sum + food.protein, 0),
      total_carbs: foods.reduce((sum, food) => sum + food.carbs, 0),
      total_fats: foods.reduce((sum, food) => sum + food.fats, 0)
    }));
  }

  /**
   * Helper method to flatten meals to items for database storage
   */
  private static flattenMealsToItems(mealPlanId: string, meals: any[]) {
    const items: any[] = [];
    
    meals.forEach(meal => {
      meal.foods.forEach((food: any, index: number) => {
        items.push({
          meal_plan_id: mealPlanId,
          meal_type: meal.type,
          food_id: food.food_id,
          food_name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          order_index: index
        });
      });
    });

    return items;
  }

  /**
   * Helper method to get meal type display name
   */
  private static getMealTypeName(type: string): string {
    const names: Record<string, string> = {
      breakfast: 'Café da Manhã',
      morning_snack: 'Lanche da Manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da Tarde',
      dinner: 'Jantar',
      evening_snack: 'Ceia'
    };
    return names[type] || type;
  }

  // Legacy method implementations
  static async getMealPlanById(id: string, userId: string): Promise<MealPlanResponse> {
    return this.getMealPlan(id);
  }

  static async getPatientMealPlans(patientId: string, userId: string): Promise<MealPlanListResponse> {
    return this.getMealPlans(userId, { patient_id: patientId });
  }

  static async saveMealPlan(mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlanResponse> {
    return this.createMealPlan(mealPlanData);
  }

  static async updateMealPlan(
    id: string, 
    updates: Partial<MealPlan>
  ): Promise<MealPlanResponse> {
    try {
      const { data: mealPlan, error: updateError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fats: updates.total_fats,
          notes: updates.notes,
          is_template: updates.is_template,
          day_of_week: updates.day_of_week
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating meal plan:', updateError);
        return { success: false, error: updateError.message };
      }

      if (updates.meals) {
        await supabase
          .from('meal_plan_items')
          .delete()
          .eq('meal_plan_id', id);

        const items = this.flattenMealsToItems(id, updates.meals);
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(items);

          if (itemsError) {
            console.error('Error updating meal plan items:', itemsError);
            return { success: false, error: itemsError.message };
          }
        }
      }

      return { success: true, data: { ...mealPlan, meals: updates.meals || [] } as MealPlan };
    } catch (error: any) {
      console.error('Error in updateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase
        .from('meal_plan_items')
        .delete()
        .eq('meal_plan_id', id);

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

  static async generateMealPlan(
    userId: string,
    patientId: string,
    targets: MacroTargets,
    date: string = new Date().toISOString().split('T')[0]
  ): Promise<MealPlanResponse> {
    try {
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: userId,
        p_patient_id: patientId,
        p_target_calories: targets.calories,
        p_target_protein: targets.protein,
        p_target_carbs: targets.carbs,
        p_target_fats: targets.fats,
        p_date: date
      });

      if (error) {
        console.error('Error generating meal plan:', error);
        return { success: false, error: error.message };
      }

      return this.getMealPlan(data);
    } catch (error: any) {
      console.error('Error in generateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }
}

export const mealPlanService = MealPlanService;

// Legacy exports for backward compatibility
export const saveMealPlan = MealPlanService.saveMealPlan;
export const getPatientMealPlans = MealPlanService.getPatientMealPlans;
export const getMealPlanById = MealPlanService.getMealPlanById;
