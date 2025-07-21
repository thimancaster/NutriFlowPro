
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanMeal } from '@/types/meal-plan';
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
  async getMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      console.log('Fetching meal plans for user:', userId);
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

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

  async createMealPlan(mealPlan: Omit<MealPlan, 'id' | 'created_at' | 'updated_at'>): Promise<MealPlan> {
    try {
      console.log('Creating meal plan:', mealPlan);
      
      // Validate required fields
      if (!mealPlan.user_id) {
        throw new Error('user_id is required');
      }
      if (!mealPlan.date) {
        throw new Error('date is required');
      }
      if (!mealPlan.meals) {
        throw new Error('meals is required');
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
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      const createdMealPlan = convertDbToMealPlan(data);
      console.log('Created meal plan:', createdMealPlan);
      return createdMealPlan;
    } catch (error) {
      console.error('Failed to create meal plan:', error);
      throw error;
    }
  },

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
    try {
      console.log('Updating meal plan:', id, updates);
      
      // Convert meals to JSON if present in updates
      const dbUpdates = updates.meals 
        ? { ...updates, meals: convertMealsToJson(updates.meals) }
        : updates;

      const { data, error } = await supabase
        .from('meal_plans')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating meal plan:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from update');
      }

      const updatedMealPlan = convertDbToMealPlan(data);
      console.log('Updated meal plan:', updatedMealPlan);
      return updatedMealPlan;
    } catch (error) {
      console.error('Failed to update meal plan:', error);
      throw error;
    }
  },

  async deleteMealPlan(id: string): Promise<void> {
    try {
      console.log('Deleting meal plan:', id);
      
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting meal plan:', error);
        throw error;
      }

      console.log('Meal plan deleted successfully');
    } catch (error) {
      console.error('Failed to delete meal plan:', error);
      throw error;
    }
  },

  async generateMealPlan(params: {
    userId: string;
    patientId?: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    date?: string;
  }): Promise<string> {
    try {
      console.log('Generating meal plan with params:', params);
      
      const { data, error } = await supabase.rpc('generate_meal_plan', {
        p_user_id: params.userId,
        p_patient_id: params.patientId,
        p_target_calories: params.targetCalories,
        p_target_protein: params.targetProtein,
        p_target_carbs: params.targetCarbs,
        p_target_fats: params.targetFats,
        p_date: params.date
      });

      if (error) {
        console.error('Error generating meal plan:', error);
        throw error;
      }

      console.log('Generated meal plan ID:', data);
      return data;
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      throw error;
    }
  }
};

export default MealPlanService;
