import { supabase } from '@/integrations/supabase/client';
import { 
  ConsolidatedMealPlan, 
  MealPlanGenerationParams, 
  MealPlanGenerationResult,
  PDFMealPlanData,
  PDFMeal,
  MEAL_TYPES,
  MEAL_ORDER,
  DEFAULT_MEAL_DISTRIBUTION,
  MEAL_TIMES,
  type MealType
} from '@/types/mealPlanTypes';

/**
 * Serviço consolidado para geração e gerenciamento de planos alimentares
 * FONTE ÚNICA DE VERDADE - MealPlanServiceV3
 */
export class MealPlanServiceV3 {
  
  /**
   * Gera um plano alimentar usando a função RPC com inteligência cultural
   */
  static async generateMealPlan(params: MealPlanGenerationParams): Promise<MealPlanGenerationResult> {
    try {
      console.log('🚀 [MealPlanServiceV3] Gerando plano alimentar:', params);

      // Validar parâmetros
      if (!params.userId || !params.patientId) {
        throw new Error('userId e patientId são obrigatórios');
      }

      if (params.totalCalories < 800 || params.totalCalories > 5000) {
        throw new Error('Calorias devem estar entre 800 e 5000');
      }

      // Chamar função RPC que usa os tipos corretos (português)
      const { data: mealPlanId, error } = await supabase
        .rpc('generate_meal_plan_with_cultural_rules', {
          p_user_id: params.userId,
          p_patient_id: params.patientId,
          p_target_calories: params.totalCalories,
          p_target_protein: params.totalProtein,
          p_target_carbs: params.totalCarbs,
          p_target_fats: params.totalFats,
          p_date: params.date || new Date().toISOString().split('T')[0]
        });

      if (error) {
        console.error('❌ [MealPlanServiceV3] Erro na RPC:', error);
        throw error;
      }

      if (!mealPlanId) {
        throw new Error('Falha ao gerar plano alimentar');
      }

      console.log('✅ [MealPlanServiceV3] Plano gerado, ID:', mealPlanId);

      // Buscar plano gerado com itens
      const mealPlan = await this.getMealPlanById(mealPlanId);
      
      if (!mealPlan.success || !mealPlan.data) {
        throw new Error('Falha ao recuperar plano gerado');
      }

      return {
        success: true,
        data: mealPlan.data
      };

    } catch (error: any) {
      console.error('❌ [MealPlanServiceV3] Erro ao gerar plano:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido ao gerar plano alimentar'
      };
    }
  }

  /**
   * Busca um plano alimentar por ID com todos os itens
   */
  static async getMealPlanById(id: string): Promise<MealPlanGenerationResult> {
    try {
      // Buscar plano alimentar
      const { data: mealPlan, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) throw planError;
      if (!mealPlan) throw new Error('Plano alimentar não encontrado');

      // Buscar itens do plano
      const { data: items, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', id)
        .order('meal_type, order_index');

      if (itemsError) throw itemsError;

      // Converter para estrutura consolidada
      const consolidatedPlan = this.convertToConsolidatedPlan(mealPlan, items || []);

      return {
        success: true,
        data: consolidatedPlan
      };

    } catch (error: any) {
      console.error('❌ [MealPlanServiceV3] Erro ao buscar plano:', error);
      return {
        success: false,
        error: error.message || 'Erro ao buscar plano alimentar'
      };
    }
  }

  /**
   * Converte dados do banco para estrutura consolidada
   */
  private static convertToConsolidatedPlan(mealPlan: any, items: any[]): ConsolidatedMealPlan {
    // Agrupar itens por meal_type
    const itemsByMealType = items.reduce((acc, item) => {
      const mealType = item.meal_type as MealType;
      if (!acc[mealType]) {
        acc[mealType] = [];
      }
      acc[mealType].push({
        id: item.id,
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
    }, {} as Record<MealType, any[]>);

    // Criar meals consolidadas
    const meals = MEAL_ORDER.map(mealType => {
      const mealItems = itemsByMealType[mealType] || [];
      
      // Calcular totais da refeição
      const totals = mealItems.reduce(
        (acc, item) => ({
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
        foods: [], // Add empty foods array
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

    return {
      id: mealPlan.id,
      name: mealPlan.name || 'Plano Alimentar', // Add required name field
      user_id: mealPlan.user_id,
      patient_id: mealPlan.patient_id,
      date: mealPlan.date,
      total_calories: mealPlan.total_calories,
      total_protein: mealPlan.total_protein,
      total_carbs: mealPlan.total_carbs,
      total_fats: mealPlan.total_fats,
      meals,
      notes: mealPlan.notes,
      created_at: mealPlan.created_at,
      updated_at: mealPlan.updated_at
    };
  }

  /**
   * Converte plano consolidado para formato PDF
   */
  static convertToPDFFormat(
    mealPlan: ConsolidatedMealPlan, 
    patientName: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ): PDFMealPlanData {
    return {
      patient_name: patientName,
      patient_age: patientAge,
      patient_gender: patientGender,
      total_calories: mealPlan.total_calories,
      total_protein: mealPlan.total_protein,
      total_carbs: mealPlan.total_carbs,
      total_fats: mealPlan.total_fats,
      meals: mealPlan.meals.map(meal => ({
        id: meal.id,
        name: meal.name,
        time: meal.time || '',
        items: meal.items?.map(item => ({
          food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        })) || [],
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats
      }))
    };
  }

  /**
   * Atualizar plano alimentar
   */
  static async updateMealPlan(id: string, updates: Partial<ConsolidatedMealPlan>): Promise<MealPlanGenerationResult> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fats: updates.total_fats,
          notes: updates.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Retornar plano atualizado
      return await this.getMealPlanById(id);

    } catch (error: any) {
      console.error('❌ [MealPlanServiceV3] Erro ao atualizar plano:', error);
      return {
        success: false,
        error: error.message || 'Erro ao atualizar plano alimentar'
      };
    }
  }

  /**
   * Listar planos alimentares do usuário
   */
  static async listMealPlans(userId: string, patientId?: string): Promise<{ success: boolean; data?: ConsolidatedMealPlan[]; error?: string }> {
    try {
      let query = supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter para formato consolidado (sem itens para lista)
      const consolidatedPlans = (data || []).map(plan => ({
        id: plan.id,
        user_id: plan.user_id,
        patient_id: plan.patient_id,
        date: plan.date,
        total_calories: plan.total_calories,
        total_protein: plan.total_protein,
        total_carbs: plan.total_carbs,
        total_fats: plan.total_fats,
        meals: [], // Não carregar itens na listagem
        notes: plan.notes,
        created_at: plan.created_at,
        updated_at: plan.updated_at
      }));

      return {
        success: true,
        data: consolidatedPlans
      };

    } catch (error: any) {
      console.error('❌ [MealPlanServiceV3] Erro ao listar planos:', error);
      return {
        success: false,
        error: error.message || 'Erro ao listar planos alimentares'
      };
    }
  }
}
