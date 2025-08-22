
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';

export const useMealPlanQuery = (mealPlanId: string | undefined) => {
  return useQuery({
    queryKey: ['meal-plan', mealPlanId],
    queryFn: async (): Promise<ConsolidatedMealPlan | null> => {
      if (!mealPlanId) return null;
      
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            id,
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
        .eq('id', mealPlanId)
        .single();

      if (error) {
        throw new Error(`Error fetching meal plan: ${error.message}`);
      }

      // Transform the data to match ConsolidatedMealPlan structure
      const mealPlan: ConsolidatedMealPlan = {
        id: data.id,
        user_id: data.user_id,
        patient_id: data.patient_id,
        calculation_id: data.calculation_id,
        date: data.date,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        notes: data.notes,
        is_template: data.is_template,
        day_of_week: data.day_of_week,
        created_at: data.created_at,
        updated_at: data.updated_at,
        meals: data.meals || []
      };

      return mealPlan;
    },
    enabled: !!mealPlanId
  });
};
