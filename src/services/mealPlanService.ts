
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanMeal } from '@/types';

export interface MealPlanGenerationParams {
  patientId: string;
  calculationId: string;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  date?: string;
}

export const MealPlanService = {
  async generateMealPlan(params: MealPlanGenerationParams): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    console.log('[ATTEND:E2E] Generating meal plan with params:', params);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) {
        throw new Error('User not authenticated');
      }

      const mealPlanId = await generateMealPlanWithSupabase(
        user.user.id,
        params.patientId,
        params.targets.calories,
        params.targets.protein,
        params.targets.carbs,
        params.targets.fats,
        params.date
      );

      // Fetch the generated meal plan
      const { data: mealPlan, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (*)
        `)
        .eq('id', mealPlanId)
        .single();

      if (error) throw error;

      // Transform to expected format
      const transformedMealPlan: MealPlan = {
        id: mealPlan.id,
        name: `Plano - ${new Date(mealPlan.date).toLocaleDateString('pt-BR')}`,
        user_id: mealPlan.user_id,
        patient_id: mealPlan.patient_id,
        date: mealPlan.date,
        total_calories: mealPlan.total_calories,
        total_protein: mealPlan.total_protein,
        total_carbs: mealPlan.total_carbs,
        total_fats: mealPlan.total_fats,
        meals: transformMealsFromItems(mealPlan.meal_plan_items || []),
        notes: mealPlan.notes,
        created_at: mealPlan.created_at,
        updated_at: mealPlan.updated_at
      };

      console.log('[ATTEND:E2E] Meal plan generated successfully');
      return { success: true, data: transformedMealPlan };

    } catch (error: any) {
      console.error('[ATTEND:E2E] Error generating meal plan:', error);
      return { success: false, error: error.message };
    }
  },

  async getMealPlan(id: string): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const transformedMealPlan: MealPlan = {
        id: data.id,
        name: `Plano - ${new Date(data.date).toLocaleDateString('pt-BR')}`,
        user_id: data.user_id,
        patient_id: data.patient_id,
        date: data.date,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        meals: transformMealsFromItems(data.meal_plan_items || []),
        notes: data.notes,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return { success: true, data: transformedMealPlan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update({
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fats: updates.total_fats,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.getMealPlan(id);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getMealPlans(patientId: string): Promise<{ success: boolean; data?: MealPlan[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (*)
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mealPlans: MealPlan[] = (data || []).map(item => ({
        id: item.id,
        name: `Plano - ${new Date(item.date).toLocaleDateString('pt-BR')}`,
        user_id: item.user_id,
        patient_id: item.patient_id,
        date: item.date,
        total_calories: item.total_calories,
        total_protein: item.total_protein,
        total_carbs: item.total_carbs,
        total_fats: item.total_fats,
        meals: transformMealsFromItems(item.meal_plan_items || []),
        notes: item.notes,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      return { success: true, data: mealPlans };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteMealPlan(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Helper function to use Supabase function
async function generateMealPlanWithSupabase(
  userId: string,
  patientId: string,
  calories: number,
  protein: number,
  carbs: number,
  fats: number,
  date?: string
): Promise<string> {
  const { data, error } = await supabase.rpc('generate_meal_plan', {
    p_user_id: userId,
    p_patient_id: patientId,
    p_target_calories: calories,
    p_target_protein: protein,
    p_target_carbs: carbs,
    p_target_fats: fats,
    p_date: date || new Date().toISOString().split('T')[0]
  });

  if (error) throw error;
  return data;
}

// Helper function to transform meal plan items to meals
function transformMealsFromItems(items: any[]): MealPlanMeal[] {
  const mealTypes = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
  const mealNames = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];

  return mealTypes.map((type, index) => {
    const mealItems = items.filter(item => item.meal_type === type);
    
    return {
      id: `${type}-meal`,
      name: mealNames[index],
      type: type,
      foods: mealItems.map(item => ({
        id: item.id,
        name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats
      })),
      totalCalories: mealItems.reduce((sum, item) => sum + (item.calories || 0), 0),
      totalProtein: mealItems.reduce((sum, item) => sum + (item.protein || 0), 0),
      totalCarbs: mealItems.reduce((sum, item) => sum + (item.carbs || 0), 0),
      totalFats: mealItems.reduce((sum, item) => sum + (item.fats || 0), 0)
    };
  });
}
