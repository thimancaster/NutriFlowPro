/**
 * MEAL PLAN ORCHESTRATOR - STUB
 * Mantido para compatibilidade com componentes legados.
 * A lógica de geração foi centralizada em AutoGenerationService.
 */

import { AutoGenerationService, PatientProfile } from './AutoGenerationService';
import { ConsolidatedMealPlan, ConsolidatedMeal, MealType, MEAL_TYPES, MEAL_TIMES, DEFAULT_MEAL_DISTRIBUTION } from '@/types/mealPlanTypes';
import { supabase } from '@/integrations/supabase/client';

export interface AutoGenParams {
  patientId: string;
  userId: string;
  calculationResults: any;
  patientData?: any;
  preferences?: {
    objective?: string;
    restrictions?: string[];
  };
}

export class MealPlanOrchestrator {
  /**
   * Gera um plano alimentar automático (método principal)
   * @deprecated - Usar AutoGenerationService.generatePlan diretamente
   */
  static async generateAutomaticPlan(params: AutoGenParams): Promise<ConsolidatedMealPlan> {
    return this.autoGenerate(params);
  }

  /**
   * Gera um plano alimentar automático
   * @deprecated - Usar AutoGenerationService.generatePlan diretamente
   */
  static async autoGenerate(params: AutoGenParams): Promise<ConsolidatedMealPlan> {
    console.log('[DEPRECATED] MealPlanOrchestrator.autoGenerate - migrar para AutoGenerationService');
    
    const { calculationResults, preferences } = params;
    
    // Extrai metas calóricas
    const vet = calculationResults?.vet || 2000;
    const protein_g = calculationResults?.macros?.protein?.grams || calculationResults?.macros?.protein || 100;
    const carb_g = calculationResults?.macros?.carbs?.grams || calculationResults?.macros?.carbs || 250;
    const fat_g = calculationResults?.macros?.fat?.grams || calculationResults?.macros?.fat || 70;

    // Cria estrutura de refeições com distribuição padrão
    const refeicoes = Object.entries(DEFAULT_MEAL_DISTRIBUTION).map(([type, percentage], index) => ({
      nome: MEAL_TYPES[type as MealType],
      numero: index + 1,
      horario_sugerido: MEAL_TIMES[type as MealType],
      itens: [],
      alvo_kcal: Math.round(vet * (percentage / 100)),
      alvo_ptn_g: Math.round(protein_g * (percentage / 100)),
      alvo_cho_g: Math.round(carb_g * (percentage / 100)),
      alvo_lip_g: Math.round(fat_g * (percentage / 100)),
    }));

    // Usa o novo motor
    const profile: PatientProfile = {
      objective: preferences?.objective || 'manutencao',
      restrictions: preferences?.restrictions || [],
      gender: 'male'
    };

    const generatedRefeicoes = await AutoGenerationService.generatePlan(refeicoes, profile);

    // Converte para formato ConsolidatedMealPlan
    const meals: ConsolidatedMeal[] = generatedRefeicoes.map((ref, idx) => {
      const mealTypes: MealType[] = ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
      const mealType = mealTypes[idx] || 'lunch';
      
      const totalCalories = ref.itens.reduce((sum, item) => sum + item.kcal_calculado, 0);
      const totalProtein = ref.itens.reduce((sum, item) => sum + item.ptn_g_calculado, 0);
      const totalCarbs = ref.itens.reduce((sum, item) => sum + item.cho_g_calculado, 0);
      const totalFats = ref.itens.reduce((sum, item) => sum + item.lip_g_calculado, 0);

      return {
        id: `meal_${mealType}`,
        name: ref.nome,
        type: mealType,
        time: ref.horario_sugerido || MEAL_TIMES[mealType],
        foods: ref.itens.map(item => ({
          id: item.alimento_id,
          name: item.alimento_nome,
          quantity: Math.round(item.peso_total_g),
          unit: 'g',
          calories: Math.round(item.kcal_calculado),
          protein: Math.round(item.ptn_g_calculado * 10) / 10,
          carbs: Math.round(item.cho_g_calculado * 10) / 10,
          fat: Math.round(item.lip_g_calculado * 10) / 10,
        })),
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFats: Math.round(totalFats * 10) / 10,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein * 10) / 10,
        total_carbs: Math.round(totalCarbs * 10) / 10,
        total_fats: Math.round(totalFats * 10) / 10,
      };
    });

    const totalCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.totalProtein, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.totalCarbs, 0);
    const totalFats = meals.reduce((sum, m) => sum + m.totalFats, 0);

    return {
      id: crypto.randomUUID(),
      patient_id: params.patientId,
      user_id: params.userId,
      date: new Date().toISOString().split('T')[0],
      name: 'Plano Automático',
      total_calories: totalCalories,
      total_protein: totalProtein,
      total_carbs: totalCarbs,
      total_fats: totalFats,
      meals,
      notes: 'Plano gerado automaticamente pelo AutoGenerationService',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Salva um plano no banco
   */
  static async savePlan(plan: ConsolidatedMealPlan): Promise<string> {
    return this.saveMealPlan(plan);
  }

  /**
   * Salva um plano alimentar no banco de dados
   */
  static async saveMealPlan(plan: ConsolidatedMealPlan): Promise<string> {
    console.log('[ORCHESTRATOR] Salvando plano alimentar...');
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .upsert({
          id: plan.id || undefined,
          patient_id: plan.patient_id,
          user_id: plan.user_id,
          date: plan.date,
          total_calories: plan.total_calories,
          total_protein: plan.total_protein,
          total_carbs: plan.total_carbs,
          total_fats: plan.total_fats,
          meals: plan.meals as any,
          notes: plan.notes,
        })
        .select('id')
        .single();

      if (error) throw error;
      
      return data?.id || plan.id || '';
    } catch (error) {
      console.error('[ORCHESTRATOR] Erro ao salvar:', error);
      throw error;
    }
  }

  /**
   * Busca um plano alimentar por ID
   */
  static async getMealPlan(planId: string): Promise<ConsolidatedMealPlan | null> {
    console.log('[ORCHESTRATOR] Buscando plano:', planId);
    
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      
      if (!data) return null;

      return {
        id: data.id,
        patient_id: data.patient_id || '',
        user_id: data.user_id,
        date: data.date,
        name: 'Plano Alimentar',
        total_calories: data.total_calories,
        total_protein: data.total_protein,
        total_carbs: data.total_carbs,
        total_fats: data.total_fats,
        meals: (data.meals as any[]) || [],
        notes: data.notes || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
      };
    } catch (error) {
      console.error('[ORCHESTRATOR] Erro ao buscar plano:', error);
      return null;
    }
  }

  /**
   * Exporta plano para PDF
   * @stub - Não implementado neste stub
   */
  static async exportToPDF(plan: ConsolidatedMealPlan, options?: any): Promise<Blob | null> {
    console.log('[STUB] MealPlanOrchestrator.exportToPDF - usar serviço de PDF dedicado');
    return null;
  }
}
