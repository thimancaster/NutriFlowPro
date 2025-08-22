import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan, ConsolidatedMeal, MealPlanItem } from '@/types/mealPlanTypes';
import { 
  MealPlanGenerationParams, 
  MealPlanGenerationResult,
  MEAL_ORDER,
  MEAL_TIMES,
  DEFAULT_MEAL_DISTRIBUTION 
} from '@/types/mealPlanTypes';

export class MealPlanServiceV2 {
  static async generateMealPlan(params: MealPlanGenerationParams): Promise<MealPlanGenerationResult> {
    try {
      const targetDate = params.date || new Date().toISOString().split('T')[0];
      
      // Use the correct RPC function name
      const { data, error } = await supabase.rpc('generate_meal_plan_with_cultural_rules', {
        p_user_id: params.userId,
        p_patient_id: params.patientId,
        p_target_calories: params.totalCalories,
        p_target_protein: params.totalProtein,
        p_target_carbs: params.totalCarbs,
        p_target_fats: params.totalFats,
        p_date: targetDate
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Erro na base de dados: ${error.message}`);
      }

      if (!data) {
        return {
          success: false,
          error: 'Nenhum dado retornado do servidor'
        };
      }

      // Handle the case where data might be a string (meal plan ID)
      let mealPlanId: string;
      if (typeof data === 'string') {
        mealPlanId = data;
      } else if (typeof data === 'object' && data !== null && 'id' in data) {
        mealPlanId = (data as any).id;
      } else {
        throw new Error('Formato de resposta inválido');
      }

      // Fetch the complete meal plan
      const mealPlan = await this.getMealPlanById(mealPlanId);
      if (!mealPlan) {
        throw new Error('Falha ao recuperar plano gerado');
      }
      
      return {
        success: true,
        data: mealPlan
      };
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      return {
        success: false,
        error: error.message || 'Erro inesperado ao gerar plano alimentar'
      };
    }
  }

  private static transformDatabaseResult(
    dbResult: any, 
    params: MealPlanGenerationParams
  ): ConsolidatedMealPlan {
    const targetDate = params.date || new Date().toISOString().split('T')[0];
    
    // Group items by meal type
    const mealGroups: { [key: string]: any[] } = {};
    
    if (dbResult.meal_items && Array.isArray(dbResult.meal_items)) {
      dbResult.meal_items.forEach((item: any) => {
        const mealType = item.meal_type || 'cafe_da_manha';
        if (!mealGroups[mealType]) {
          mealGroups[mealType] = [];
        }
        mealGroups[mealType].push(item);
      });
    }

    // Create meals for each meal type
    const meals: ConsolidatedMeal[] = MEAL_ORDER.map(mealType => {
      const items = mealGroups[mealType] || [];
      
      // Calculate totals for this meal
      const totals = items.reduce(
        (acc, item) => ({
          calories: acc.calories + (item.calories || 0),
          protein: acc.protein + (item.protein || 0),
          carbs: acc.carbs + (item.carbs || 0),
          fats: acc.fats + (item.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      return {
        id: `${dbResult.id}-${mealType}`,
        type: mealType,
        name: this.getMealName(mealType),
        time: MEAL_TIMES[mealType],
        foods: [],
        items: items.map((item, index) => ({
          id: item.id || `${dbResult.id}-${mealType}-${index}`,
          meal_id: `${dbResult.id}-${mealType}`,
          food_id: item.food_id || item.id,
          food_name: item.food_name || item.name,
          quantity: item.quantity || 0,
          unit: item.unit || 'g',
          calories: item.calories || 0,
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fats: item.fats || 0,
          order_index: index
        })),
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFats: totals.fats,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats,
      };
    });

    // Calculate plan totals
    const planTotals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.total_calories,
        protein: acc.protein + meal.total_protein,
        carbs: acc.carbs + meal.total_carbs,
        fats: acc.fats + meal.total_fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    return {
      id: dbResult.id || crypto.randomUUID(),
      name: dbResult.name || 'Plano Alimentar',
      user_id: params.userId,
      patient_id: params.patientId,
      calculation_id: params.calculationId || null,
      date: targetDate,
      meals,
      total_calories: planTotals.calories,
      total_protein: planTotals.protein,
      total_carbs: planTotals.carbs,
      total_fats: planTotals.fats,
      notes: dbResult.notes || null,
      is_template: false,
      day_of_week: new Date(targetDate).getDay(),
      created_at: dbResult.created_at || new Date().toISOString(),
      updated_at: dbResult.updated_at || new Date().toISOString(),
    };
  }

  private static getMealName(mealType: string): string {
    const mealNames: { [key: string]: string } = {
      cafe_da_manha: 'Café da Manhã',
      lanche_manha: 'Lanche da Manhã',
      almoco: 'Almoço',
      lanche_tarde: 'Lanche da Tarde',
      jantar: 'Jantar',
      ceia: 'Ceia'
    };
    return mealNames[mealType] || mealType;
  }

  static async updateMealPlan(
    mealPlanId: string, 
    updates: Partial<ConsolidatedMealPlan>
  ): Promise<MealPlanGenerationResult> {
    try {
      // Update main meal plan record
      const { error: planError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fats: updates.total_fats,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealPlanId);

      if (planError) throw planError;

      // If meals are updated, handle meal items
      if (updates.meals) {
        // Delete existing items
        await supabase
          .from('meal_plan_items')
          .delete()
          .eq('meal_plan_id', mealPlanId);

        // Insert new items with correct structure
        const allItems = updates.meals.flatMap((meal, mealIndex) => 
          meal.items.map((item, itemIndex) => ({
            meal_plan_id: mealPlanId,
            food_id: item.food_id,
            food_name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            meal_type: meal.type,
            order_index: itemIndex
          }))
        );

        if (allItems.length > 0) {
          const { error: itemsError } = await supabase
            .from('meal_plan_items')
            .insert(allItems);

          if (itemsError) throw itemsError;
        }
      }

      // Return updated meal plan
      const updatedPlan = await this.getMealPlanById(mealPlanId);
      return {
        success: true,
        data: updatedPlan
      };
    } catch (error: any) {
      console.error('Error updating meal plan:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar plano alimentar'
      };
    }
  }

  static async getMealPlanById(id: string): Promise<ConsolidatedMealPlan | null> {
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
      if (!data) return null;

      // Transform to ConsolidatedMealPlan format
      const mealGroups: { [key: string]: any[] } = {};
      
      data.meal_plan_items?.forEach((item: any) => {
        const mealType = item.meal_type || 'cafe_da_manha';
        if (!mealGroups[mealType]) {
          mealGroups[mealType] = [];
        }
        mealGroups[mealType].push(item);
      });

      const meals: ConsolidatedMeal[] = MEAL_ORDER.map(mealType => {
        const items = mealGroups[mealType] || [];
        
        const totals = items.reduce(
          (acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fats: acc.fats + (item.fats || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        return {
          id: `${data.id}-${mealType}`,
          type: mealType,
          name: this.getMealName(mealType),
          time: MEAL_TIMES[mealType],
          foods: [],
          items: items.map(item => ({
            id: item.id,
            meal_id: `${data.id}-${mealType}`,
            food_id: item.food_id,
            food_name: item.food_name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
            order_index: item.order_index || 0
          })),
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFats: totals.fats,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        };
      });

      return {
        id: data.id,
        name: data.name || 'Plano Alimentar',
        user_id: data.user_id,
        patient_id: data.patient_id,
        calculation_id: data.calculation_id,
        date: data.date,
        meals,
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        notes: data.notes,
        is_template: data.is_template,
        day_of_week: data.day_of_week,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      return null;
    }
  }
}
