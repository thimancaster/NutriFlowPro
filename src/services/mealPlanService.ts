
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanMeal, MealPlanFilters, MacroTargets } from '@/types/mealPlan';
import { Json } from '@/integrations/supabase/types';

// Type conversion utilities
const convertJsonToMeals = (meals: Json): MealPlanMeal[] => {
  try {
    if (typeof meals === 'string') {
      return JSON.parse(meals) as MealPlanMeal[];
    }
    if (Array.isArray(meals)) {
      return meals as MealPlanMeal[];
    }
    return [];
  } catch (error) {
    console.error('Error converting JSON to meals:', error);
    return [];
  }
};

const convertMealsToJson = (meals: MealPlanMeal[]): Json => {
  try {
    return JSON.stringify(meals) as Json;
  } catch (error) {
    console.error('Error converting meals to JSON:', error);
    return '[]' as Json;
  }
};

// Convert database record to MealPlan type
const convertDbToMealPlan = (dbRecord: any): MealPlan => {
  return {
    ...dbRecord,
    meals: convertJsonToMeals(dbRecord.meals)
  };
};

export const MealPlanService = {
  async getMealPlans(userId: string, filters: MealPlanFilters = {}): Promise<MealPlan[]> {
    try {
      console.log('Fetching meal plans for user:', userId, 'with filters:', filters);
      
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId);

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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meal plans:', error);
        throw error;
      }

      console.log('Raw meal plans data:', data);
      
      // Convert database records to MealPlan type
      const mealPlans = data?.map(convertDbToMealPlan) || [];
      
      console.log('Converted meal plans:', mealPlans);
      return mealPlans;
    } catch (error) {
      console.error('Failed to fetch meal plans:', error);
      throw error;
    }
  },

  async getMealPlan(id: string): Promise<MealPlan | null> {
    try {
      console.log('Fetching meal plan by ID:', id);
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meal plan:', error);
        throw error;
      }

      if (!data) {
        console.log('No meal plan found with ID:', id);
        return null;
      }

      const mealPlan = convertDbToMealPlan(data);
      console.log('Converted meal plan:', mealPlan);
      return mealPlan;
    } catch (error) {
      console.error('Failed to fetch meal plan:', error);
      throw error;
    }
  },

  // Alias for backward compatibility
  getMealPlanById(id: string): Promise<MealPlan | null> {
    return this.getMealPlan(id);
  },

  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      console.log('Creating meal plan:', mealPlan);
      
      // Validate required fields
      if (!mealPlan.user_id) {
        return { success: false, error: 'user_id is required' };
      }
      if (!mealPlan.date) {
        return { success: false, error: 'date is required' };
      }
      if (!mealPlan.meals) {
        return { success: false, error: 'meals is required' };
      }

      // Convert meals to JSON for database storage
      const dbMealPlan = {
        ...mealPlan,
        meals: convertMealsToJson(mealPlan.meals)
      };

      const { data, error } = await supabase
        .from('meal_plans')
        .insert(dbMealPlan)
        .select()
        .single();

      if (error) {
        console.error('Error creating meal plan:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'No data returned from insert' };
      }

      const createdMealPlan = convertDbToMealPlan(data);
      console.log('Created meal plan:', createdMealPlan);
      return { success: true, data: createdMealPlan };
    } catch (error: any) {
      console.error('Failed to create meal plan:', error);
      return { success: false, error: error.message };
    }
  },

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      console.log('Updating meal plan:', id, updates);
      
      // Convert meals to JSON if present in updates
      const dbUpdates: any = { ...updates };
      if (updates.meals) {
        dbUpdates.meals = convertMealsToJson(updates.meals);
      }

      const { data, error } = await supabase
        .from('meal_plans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'No data returned from update' };
      }

      const updatedMealPlan = convertDbToMealPlan(data);
      console.log('Updated meal plan:', updatedMealPlan);
      return { success: true, data: updatedMealPlan };
    } catch (error: any) {
      console.error('Failed to update meal plan:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
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

      console.log('Meal plan deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete meal plan:', error);
      return { success: false, error: error.message };
    }
  },

  async generateMealPlan(
    userId: string,
    patientId: string,
    targets: MacroTargets,
    date?: string
  ): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      console.log('Generating meal plan with params:', { userId, patientId, targets, date });
      
      const { data: mealPlanId, error } = await supabase.rpc('generate_meal_plan_with_cultural_rules', {
        p_user_id: userId,
        p_patient_id: patientId,
        p_target_calories: targets.calories,
        p_target_protein: targets.protein,
        p_target_carbs: targets.carbs,
        p_target_fats: targets.fats,
        p_date: date || new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error generating meal plan:', error);
        return { success: false, error: error.message };
      }

      if (!mealPlanId) {
        return { success: false, error: 'No meal plan ID returned from generation' };
      }

      console.log('Generated meal plan ID:', mealPlanId);

      // Fetch the complete generated meal plan
      const mealPlan = await this.getMealPlan(mealPlanId);
      if (!mealPlan) {
        return { success: false, error: 'Failed to fetch generated meal plan' };
      }

      return { success: true, data: mealPlan };
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error);
      return { success: false, error: error.message };
    }
  }
};

export default MealPlanService;
