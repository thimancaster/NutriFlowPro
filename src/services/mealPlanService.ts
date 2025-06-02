
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
        .select('*')
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

      const { data: plans, error } = await query;

      if (error) {
        console.error('Error fetching meal plans:', error);
        return { success: false, error: error.message };
      }

      // Fetch items for each meal plan separately
      const transformedData = await Promise.all(
        (plans || []).map(async (plan) => {
          const { data: items, error: itemsError } = await supabase
            .from('meal_plan_items')
            .select('*')
            .eq('meal_plan_id', plan.id)
            .order('meal_type, order_index');

          if (itemsError) {
            console.error('Error fetching meal plan items:', itemsError);
            return {
              ...plan,
              meals: []
            };
          }

          return {
            ...plan,
            meals: this.groupItemsByMealType(items || [])
          };
        })
      );

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
      const { data: plan, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meal plan:', error);
        return { success: false, error: error.message };
      }

      // Fetch items separately
      const { data: items, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', id)
        .order('meal_type, order_index');

      if (itemsError) {
        console.error('Error fetching meal plan items:', itemsError);
        return { success: false, error: itemsError.message };
      }

      const transformedData = {
        ...plan,
        meals: this.groupItemsByMealType(items || [])
      };

      return { success: true, data: transformedData as MealPlan };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new meal plan
   */
  static async createMealPlan(
    mealPlanData: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MealPlanResponse> {
    try {
      // Prepare meal plan data
      const planData = {
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
        meals: JSON.stringify(mealPlanData.meals)
      };

      // Create meal plan
      const { data: plan, error } = await supabase
        .from('meal_plans')
        .insert(planData)
        .select()
        .single();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: error.message };
      }

      // Create meal plan items
      if (mealPlanData.meals && mealPlanData.meals.length > 0) {
        const itemsData = this.flattenMealsToItems(plan.id, mealPlanData.meals);
        
        if (itemsData.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(itemsData);

          if (itemsError) {
            console.error('Error creating meal plan items:', itemsError);
            // Clean up the meal plan if items creation failed
            await supabase.from('meal_plans').delete().eq('id', plan.id);
            return { success: false, error: itemsError.message };
          }
        }
      }

      // Return the complete meal plan
      return this.getMealPlan(plan.id);

    } catch (error: any) {
      console.error('Error creating meal plan:', error);
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
      // Update meal plan
      const planUpdates: any = {};
      if (updates.date) planUpdates.date = updates.date;
      if (updates.total_calories) planUpdates.total_calories = updates.total_calories;
      if (updates.total_protein) planUpdates.total_protein = updates.total_protein;
      if (updates.total_carbs) planUpdates.total_carbs = updates.total_carbs;
      if (updates.total_fats) planUpdates.total_fats = updates.total_fats;
      if (updates.notes !== undefined) planUpdates.notes = updates.notes;
      if (updates.is_template !== undefined) planUpdates.is_template = updates.is_template;
      if (updates.day_of_week !== undefined) planUpdates.day_of_week = updates.day_of_week;
      if (updates.meals) planUpdates.meals = JSON.stringify(updates.meals);

      planUpdates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('meal_plans')
        .update(planUpdates)
        .eq('id', id);

      if (error) {
        console.error('Error updating meal plan:', error);
        return { success: false, error: error.message };
      }

      // Update items if meals are provided
      if (updates.meals) {
        // Delete existing items
        await supabase
          .from('meal_plan_items')
          .delete()
          .eq('meal_plan_id', id);

        // Insert new items
        const itemsData = this.flattenMealsToItems(id, updates.meals);
        if (itemsData.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(itemsData);

          if (itemsError) {
            console.error('Error updating meal plan items:', itemsError);
            return { success: false, error: itemsError.message };
          }
        }
      }

      // Return updated meal plan
      return this.getMealPlan(id);

    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a meal plan
   */
  static async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Items will be deleted automatically due to CASCADE
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
}

export const mealPlanService = MealPlanService;

// Legacy exports for backward compatibility
export const saveMealPlan = MealPlanService.createMealPlan;
export const getPatientMealPlans = (patientId: string, userId: string) => 
  MealPlanService.getMealPlans(userId, { patient_id: patientId });
export const getMealPlanById = MealPlanService.getMealPlan;
