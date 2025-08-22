
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan, ConsolidatedMeal, MEAL_ORDER, MEAL_TYPES, MEAL_TIMES } from '@/types/mealPlanTypes';

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

      if (!data) return null;

      // Group items by meal type
      const itemsByMealType = (data.meal_plan_items || []).reduce((acc: any, item: any) => {
        const mealType = item.meal_type;
        if (!acc[mealType]) {
          acc[mealType] = [];
        }
        acc[mealType].push({
          id: item.id,
          meal_id: `${mealType}-meal`,
          food_id: item.food_id,
          food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          order_index: item.order_index
        });
        return acc;
      }, {});

      // Create meals in proper order
      const meals: ConsolidatedMeal[] = MEAL_ORDER.map(mealType => {
        const mealItems = itemsByMealType[mealType] || [];
        
        const totals = mealItems.reduce(
          (acc: any, item: any) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fats: acc.fats + (item.fats || 0)
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        return {
          id: `${mealType}-meal`,
          type: mealType,
          name: MEAL_TYPES[mealType],
          time: MEAL_TIMES[mealType],
          foods: mealItems.map((item: any) => ({
            id: item.id,
            name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fats
          })),
          items: mealItems,
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFats: totals.fats,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats
        };
      });

      // Transform the data to match ConsolidatedMealPlan structure
      const mealPlan: ConsolidatedMealPlan = {
        id: data.id,
        user_id: data.user_id,
        patient_id: data.patient_id,
        calculation_id: data.calculation_id,
        name: data.name || 'Plano Alimentar',
        description: data.description,
        date: data.date,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        created_at: data.created_at,
        updated_at: data.updated_at,
        meals
      };

      return mealPlan;
    },
    enabled: !!mealPlanId
  });
};

// Export additional hooks for backward compatibility
export { useMealPlans } from './useMealPlans';
export { useMealPlanMutations } from './useMealPlanMutations';
