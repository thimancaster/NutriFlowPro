
import { supabase } from '@/integrations/supabase/client';
import { MealPlan, MealPlanItem, MacroTargets } from '@/types/mealPlan';

export interface CreateMealPlanParams {
  userId: string;
  patientId: string;
  calculationId?: string;
  targets: MacroTargets;
  date?: string;
}

export class MealPlanServiceV2 {
  /**
   * Generate a meal plan based on nutritional targets
   */
  static async generateMealPlan(params: CreateMealPlanParams): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      const { userId, patientId, calculationId, targets, date = new Date().toISOString().split('T')[0] } = params;
      
      console.log('Calling generate_meal_plan_with_cultural_rules with:', {
        userId,
        patientId,
        targets,
        date
      });

      // Call the culturally intelligent RPC function
      const { data: mealPlanId, error } = await supabase.rpc('generate_meal_plan_with_cultural_rules', {
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

      if (!mealPlanId) {
        return { success: false, error: 'No meal plan ID returned from generation' };
      }

      console.log('Generated meal plan ID:', mealPlanId);

      // Fetch the complete meal plan
      const result = await this.getMealPlan(mealPlanId);
      
      if (result.success && result.data) {
        console.log('Successfully fetched generated meal plan:', result.data);
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in generateMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a meal plan by ID with simplified query
   */
  static async getMealPlan(id: string): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      console.log('Fetching meal plan with ID:', id);

      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) {
        console.error('Error fetching meal plan:', planError);
        return { success: false, error: planError.message };
      }

      if (!planData) {
        return { success: false, error: 'Meal plan not found' };
      }

      console.log('Fetched meal plan data:', planData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', id)
        .order('meal_type, order_index');

      if (itemsError) {
        console.error('Error fetching meal plan items:', itemsError);
        return { success: false, error: itemsError.message };
      }

      console.log('Fetched meal plan items:', itemsData);

      // Transform data to MealPlan format
      const mealPlan: MealPlan = {
        ...planData,
        meals: this.groupItemsByMealType(itemsData || [])
      };

      console.log('Transformed meal plan:', mealPlan);

      return { success: true, data: mealPlan };
    } catch (error: any) {
      console.error('Error in getMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save meal plan changes
   */
  static async saveMealPlan(mealPlan: Partial<MealPlan> & { id: string }): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
    try {
      console.log('Saving meal plan:', mealPlan);

      // Update meal plan
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: mealPlan.total_calories,
          total_protein: mealPlan.total_protein,
          total_carbs: mealPlan.total_carbs,
          total_fats: mealPlan.total_fats,
          notes: mealPlan.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealPlan.id);

      if (updateError) {
        console.error('Error updating meal plan:', updateError);
        return { success: false, error: updateError.message };
      }

      // If meals are provided, update items
      if (mealPlan.meals) {
        // Delete existing items
        await supabase
          .from('meal_plan_items')
          .delete()
          .eq('meal_plan_id', mealPlan.id);

        // Insert new items
        const items = this.flattenMealsToItems(mealPlan.id, mealPlan.meals);
        if (items.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(items);

          if (itemsError) {
            console.error('Error inserting meal plan items:', itemsError);
            return { success: false, error: itemsError.message };
          }
        }
      }

      // Return updated meal plan
      return this.getMealPlan(mealPlan.id);
    } catch (error: any) {
      console.error('Error in saveMealPlan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Group meal plan items by meal type in chronological order
   */
  private static groupItemsByMealType(items: MealPlanItem[]) {
    console.log('Grouping items by meal type:', items);

    // Define the chronological order of meals (Brazilian standard)
    const mealOrder = [
      'cafe_da_manha',
      'lanche_manha', 
      'almoco',
      'lanche_tarde',
      'jantar',
      'ceia'
    ];

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

    console.log('Grouped items:', grouped);

    // Return meals in chronological order
    const meals = mealOrder
      .filter(mealType => grouped[mealType] && grouped[mealType].length > 0)
      .map(mealType => {
        const foods = grouped[mealType] || [];
        const meal = {
          id: `${mealType}-meal`,
          type: mealType as 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia',
          name: this.getMealTypeName(mealType),
          foods: foods,
          total_calories: foods.reduce((sum, food) => sum + (food.calories || 0), 0),
          total_protein: foods.reduce((sum, food) => sum + (food.protein || 0), 0),
          total_carbs: foods.reduce((sum, food) => sum + (food.carbs || 0), 0),
          total_fats: foods.reduce((sum, food) => sum + (food.fats || 0), 0)
        };
        
        console.log('Created meal:', meal);
        return meal;
      });

    console.log('Final meals array:', meals);
    return meals;
  }

  /**
   * Flatten meals to items for database storage
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
   * Get meal type display name in Portuguese
   */
  private static getMealTypeName(type: string): string {
    const names: Record<string, string> = {
      cafe_da_manha: 'Café da Manhã',
      lanche_manha: 'Lanche da Manhã',
      almoco: 'Almoço',
      lanche_tarde: 'Lanche da Tarde',
      jantar: 'Jantar',
      ceia: 'Ceia'
    };
    return names[type] || type;
  }
}
