
import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan, ConsolidatedMealItem, MealPlanGenerationParams, MealType, MEAL_TYPES } from '@/types/mealPlanTypes';

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  retry?: boolean;
}

export class MealPlanServiceV2 {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 segundos
  private static readonly TIMEOUT = 30000; // 30 segundos

  /**
   * Generate a meal plan with retry logic and timeout
   */
  static async generateMealPlan(params: MealPlanGenerationParams): Promise<ServiceResponse<ConsolidatedMealPlan>> {
    const { userId, patientId, totalCalories, totalProtein, totalCarbs, totalFats, date = new Date().toISOString().split('T')[0] } = params;
    
    console.log('🚀 Iniciando geração de plano alimentar:', {
      userId,
      patientId,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      date
    });

    console.warn('⚠️ [DEPRECATED] MealPlanServiceV2 está obsoleto. Use MealPlanServiceV3 para novos desenvolvimentos.');

    try {
      // Timeout wrapper
      const generateWithTimeout = Promise.race([
        this.performGeneration(userId, patientId, { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats }, date),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na geração do plano alimentar')), this.TIMEOUT)
        )
      ]);

      const mealPlanId = await generateWithTimeout;
      
      if (!mealPlanId) {
        return { success: false, error: 'ID do plano alimentar não retornado' };
      }

      console.log('✅ Plano gerado com ID:', mealPlanId);

      // Buscar o plano completo com retry
      const result = await this.getMealPlanWithRetry(mealPlanId);
      
      if (result.success && result.data) {
        console.log('✅ Plano carregado com sucesso:', {
          id: result.data.id,
          mealsCount: result.data.meals?.length || 0,
          totalCalories: result.data.total_calories
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('❌ Erro na geração do plano:', error);
      return { 
        success: false, 
        error: error.message || 'Erro inesperado na geração do plano alimentar',
        retry: true 
      };
    }
  }

  /**
   * Perform the actual RPC call
   */
  private static async performGeneration(
    userId: string, 
    patientId: string, 
    targets: { calories: number; protein: number; carbs: number; fats: number }, 
    date: string
  ): Promise<string> {
    console.log('📡 Chamando RPC generate_meal_plan_with_cultural_rules...');

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
      console.error('❌ Erro na RPC:', error);
      throw new Error(`Erro na geração: ${error.message}`);
    }

    return mealPlanId;
  }

  /**
   * Get meal plan with retry logic
   */
  private static async getMealPlanWithRetry(id: string): Promise<ServiceResponse<ConsolidatedMealPlan>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      console.log(`🔄 Tentativa ${attempt}/${this.MAX_RETRIES} de carregar plano ${id}`);

      try {
        const result = await this.getMealPlan(id);
        
        // Verificar se os dados estão completos
        if (result.success && result.data && this.validateMealPlan(result.data)) {
          console.log('✅ Plano carregado e validado com sucesso');
          return result;
        }

        // Se dados incompletos mas sem erro, tentar novamente
        if (result.success && result.data && !this.validateMealPlan(result.data)) {
          console.warn('⚠️ Plano carregado mas dados incompletos, tentando novamente...');
          lastError = new Error('Dados do plano incompletos');
        } else {
          lastError = new Error(result.error || 'Erro desconhecido');
        }

      } catch (error: any) {
        console.error(`❌ Erro na tentativa ${attempt}:`, error);
        lastError = error;
      }

      // Delay antes da próxima tentativa (exceto na última)
      if (attempt < this.MAX_RETRIES) {
        console.log(`⏳ Aguardando ${this.RETRY_DELAY}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
      }
    }

    return { 
      success: false, 
      error: `Falha após ${this.MAX_RETRIES} tentativas: ${lastError?.message}`,
      retry: true 
    };
  }

  /**
   * Get a meal plan by ID with improved error handling
   */
  static async getMealPlan(id: string): Promise<ServiceResponse<ConsolidatedMealPlan>> {
    try {
      console.log('📥 Buscando plano alimentar:', id);

      // Buscar dados do plano principal
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Usar maybeSingle para evitar erro se não encontrar

      if (planError) {
        console.error('❌ Erro ao buscar plano:', planError);
        return { success: false, error: planError.message };
      }

      if (!planData) {
        console.error('❌ Plano não encontrado:', id);
        return { success: false, error: 'Plano alimentar não encontrado' };
      }

      console.log('📋 Dados do plano encontrados:', {
        id: planData.id,
        totalCalories: planData.total_calories
      });

      // Buscar itens do plano
      const { data: itemsData, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', id)
        .order('meal_type, order_index');

      if (itemsError) {
        console.error('❌ Erro ao buscar itens:', itemsError);
        return { success: false, error: itemsError.message };
      }

      console.log('🍽️ Itens encontrados:', itemsData?.length || 0);

      // Convert items to proper ConsolidatedMealItem type with safety mapping
      const typedItems: ConsolidatedMealItem[] = (itemsData || []).map(item => ({
        id: item.id,
        food_id: item.food_id,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        order_index: item.order_index,
        meal_type: this.mapMealTypeToPortuguese(item.meal_type)
      }));

      // Transformar dados para formato ConsolidatedMealPlan
      const mealPlan: ConsolidatedMealPlan = {
        id: planData.id,
        user_id: planData.user_id,
        patient_id: planData.patient_id,
        date: planData.date,
        total_calories: planData.total_calories,
        total_protein: planData.total_protein,
        total_carbs: planData.total_carbs,
        total_fats: planData.total_fats,
        meals: this.groupItemsByMealType(typedItems),
        notes: planData.notes,
        created_at: planData.created_at,
        updated_at: planData.updated_at
      };

      console.log('✅ Plano transformado:', {
        id: mealPlan.id,
        mealsCount: mealPlan.meals.length
      });

      return { success: true, data: mealPlan };
    } catch (error: any) {
      console.error('❌ Erro inesperado ao buscar plano:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Map meal type to Portuguese (safety fallback for any legacy English values)
   */
  private static mapMealTypeToPortuguese(mealType: string): MealType {
    const mapping: Record<string, MealType> = {
      'breakfast': 'cafe_da_manha',
      'morning_snack': 'lanche_manha',
      'lunch': 'almoco',
      'afternoon_snack': 'lanche_tarde',
      'dinner': 'jantar',
      'evening_snack': 'ceia'
    };
    
    return (mapping[mealType] || mealType) as MealType;
  }

  /**
   * Validate meal plan completeness
   */
  private static validateMealPlan(mealPlan: ConsolidatedMealPlan): boolean {
    if (!mealPlan.id || !mealPlan.meals) {
      console.warn('⚠️ Plano sem ID ou meals');
      return false;
    }

    if (mealPlan.meals.length === 0) {
      console.warn('⚠️ Plano sem refeições');
      return false;
    }

    // Verificar se pelo menos uma refeição tem items
    const hasItems = mealPlan.meals.some(meal => meal.items && meal.items.length > 0);
    if (!hasItems) {
      console.warn('⚠️ Nenhuma refeição possui itens');
      return false;
    }

    console.log('✅ Plano validado com sucesso');
    return true;
  }

  /**
   * Save meal plan changes
   */
  static async saveMealPlan(mealPlan: Partial<ConsolidatedMealPlan> & { id: string }): Promise<ServiceResponse<ConsolidatedMealPlan>> {
    try {
      console.log('💾 Salvando plano alimentar:', mealPlan.id);

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
        console.error('❌ Erro ao atualizar plano:', updateError);
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
            console.error('❌ Erro ao inserir itens:', itemsError);
            return { success: false, error: itemsError.message };
          }
        }
      }

      // Return updated meal plan
      return this.getMealPlan(mealPlan.id);
    } catch (error: any) {
      console.error('❌ Erro ao salvar plano:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Group meal plan items by meal type in chronological order
   */
  private static groupItemsByMealType(items: ConsolidatedMealItem[]) {
    console.log('🔄 Agrupando itens por tipo de refeição:', items.length);

    const mealOrder: MealType[] = [
      'cafe_da_manha',
      'lanche_manha', 
      'almoco',
      'lanche_tarde',
      'jantar',
      'ceia'
    ];

    const grouped = items.reduce((acc, item) => {
      const validMealType = this.mapMealTypeToPortuguese(item.meal_type || 'cafe_da_manha');
      if (!acc[validMealType]) {
        acc[validMealType] = [];
      }
      acc[validMealType].push(item);
      return acc;
    }, {} as Record<MealType, ConsolidatedMealItem[]>);

    const meals = mealOrder
      .filter(mealType => grouped[mealType] && grouped[mealType].length > 0)
      .map(mealType => {
        const mealItems = grouped[mealType] || [];
        const meal = {
          id: `${mealType}-meal`,
          type: mealType,
          name: MEAL_TYPES[mealType],
          time: '07:00', // Default time, should be mapped properly
          items: mealItems,
          total_calories: mealItems.reduce((sum, item) => sum + (item.calories || 0), 0),
          total_protein: mealItems.reduce((sum, item) => sum + (item.protein || 0), 0),
          total_carbs: mealItems.reduce((sum, item) => sum + (item.carbs || 0), 0),
          total_fats: mealItems.reduce((sum, item) => sum + (item.fats || 0), 0)
        };
        
        return meal;
      });

    console.log('✅ Refeições agrupadas:', meals.length);
    return meals;
  }

  /**
   * Flatten meals to items for database storage
   */
  private static flattenMealsToItems(mealPlanId: string, meals: any[]) {
    const items: any[] = [];
    
    meals.forEach(meal => {
      meal.items?.forEach((item: ConsolidatedMealItem, index: number) => {
        items.push({
          meal_plan_id: mealPlanId,
          meal_type: meal.type,
          food_id: item.food_id,
          food_name: item.food_name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          order_index: index
        });
      });
    });

    return items;
  }

  /**
   * Get meal type display name in Portuguese
   */
  private static getMealTypeName(type: MealType): string {
    return MEAL_TYPES[type] || type;
  }
}
