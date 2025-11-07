/**
 * MEAL PLAN ORCHESTRATOR - SINGLE SOURCE OF TRUTH
 * Coordena todo o fluxo de criação, edição e persistência de planos alimentares
 */

import { supabase } from '@/integrations/supabase/client';
import { AutoGenerationService } from './AutoGenerationService';
import { PersistenceService, SaveOptions } from './PersistenceService';
import { ConsolidatedMealPlan, MealPlanGenerationParams } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';

export interface AutoGenParams {
  userId: string;
  patientId: string;
  calculationResults: CalculationResult;
  patientData?: {
    name: string;
    age?: number;
    gender?: string;
    preferences?: string[];
    restrictions?: string[];
  };
}

export interface MealPlanChanges {
  mealId: string;
  itemId?: string;
  changes: {
    quantity?: number;
    foodId?: string;
    action?: 'add' | 'remove' | 'update';
  };
}

export class MealPlanOrchestrator {
  /**
   * Gera um plano alimentar automático completo
   */
  static async generateAutomaticPlan(params: AutoGenParams): Promise<ConsolidatedMealPlan> {
    try {
      console.log('🎯 Orchestrator: Iniciando geração automática...');
      
      // Delega para o serviço de geração automática
      const mealPlan = await AutoGenerationService.generateMealPlan(
        params.calculationResults,
        params.patientData
      );

      // Adiciona IDs e metadados
      const completePlan: ConsolidatedMealPlan = {
        ...mealPlan,
        id: crypto.randomUUID(),
        patient_id: params.patientId,
        user_id: params.userId,
        date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('✅ Orchestrator: Plano gerado com sucesso');
      return completePlan;
      
    } catch (error) {
      console.error('❌ Orchestrator: Erro na geração automática', error);
      throw error;
    }
  }

  /**
   * Edita um plano alimentar existente
   */
  static async editMealPlan(planId: string, changes: MealPlanChanges): Promise<void> {
    try {
      console.log('✏️ Orchestrator: Editando plano...', changes);
      
      // TODO: Implementar lógica de edição
      // Por enquanto, apenas log
      
    } catch (error) {
      console.error('❌ Orchestrator: Erro na edição', error);
      throw error;
    }
  }

  /**
   * Salva um plano alimentar no banco de dados (usa PersistenceService)
   */
  static async saveMealPlan(
    plan: ConsolidatedMealPlan,
    options: SaveOptions = {}
  ): Promise<string> {
    try {
      console.log('💾 Orchestrator: Delegando salvamento para PersistenceService...');
      return await PersistenceService.saveMealPlan(plan, options);
    } catch (error) {
      console.error('❌ Orchestrator: Erro ao salvar plano', error);
      throw error;
    }
  }

  /**
   * Carrega um plano alimentar completo
   */
  static async getMealPlan(planId: string): Promise<ConsolidatedMealPlan> {
    try {
      console.log('📖 Orchestrator: Carregando plano...', planId);

      // 1. Buscar meal_plan
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      if (!planData) throw new Error('Plano não encontrado');

      // 2. Buscar meal_plan_items
      const { data: itemsData, error: itemsError } = await supabase
        .from('meal_plan_items')
        .select('*')
        .eq('meal_plan_id', planId)
        .order('meal_type')
        .order('order_index');

      if (itemsError) throw itemsError;

      // 3. Agrupar por meal_type
      const mealsByType = (itemsData || []).reduce((acc, item) => {
        if (!acc[item.meal_type]) {
          acc[item.meal_type] = [];
        }
        acc[item.meal_type].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // 4. Criar meals
      const meals = Object.entries(mealsByType).map(([type, items]) => {
        const totalCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0);
        const totalProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);
        const totalCarbs = items.reduce((sum, i) => sum + (i.carbs || 0), 0);
        const totalFats = items.reduce((sum, i) => sum + (i.fats || 0), 0);

        return {
          id: `meal_${type}`,
          name: type,
          type: type as any,
          foods: items.map(i => ({
            id: i.food_id || i.id,
            name: i.food_name,
            quantity: i.quantity,
            unit: i.unit,
            calories: i.calories,
            protein: i.protein,
            carbs: i.carbs,
            fat: i.fats,
          })),
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
          total_calories: totalCalories,
          total_protein: totalProtein,
          total_carbs: totalCarbs,
          total_fats: totalFats,
        };
      });

      const result: ConsolidatedMealPlan = {
        id: planData.id,
        patient_id: planData.patient_id,
        user_id: planData.user_id,
        calculation_id: planData.calculation_id,
        name: `Plano - ${new Date(planData.date).toLocaleDateString('pt-BR')}`,
        date: planData.date,
        total_calories: planData.total_calories,
        total_protein: planData.total_protein,
        total_carbs: planData.total_carbs,
        total_fats: planData.total_fats,
        meals,
        notes: planData.notes,
        created_at: planData.created_at,
        updated_at: planData.updated_at,
      };

      console.log('✅ Orchestrator: Plano carregado com sucesso');
      return result;
      
    } catch (error) {
      console.error('❌ Orchestrator: Erro ao carregar plano', error);
      throw error;
    }
  }

  /**
   * Lista planos de um paciente
   */
  static async listPatientMealPlans(patientId: string): Promise<ConsolidatedMealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(plan => ({
        id: plan.id,
        patient_id: plan.patient_id,
        user_id: plan.user_id,
        name: `Plano - ${new Date(plan.date).toLocaleDateString('pt-BR')}`,
        date: plan.date,
        total_calories: plan.total_calories,
        total_protein: plan.total_protein,
        total_carbs: plan.total_carbs,
        total_fats: plan.total_fats,
        meals: [],
        notes: plan.notes,
        created_at: plan.created_at,
        updated_at: plan.updated_at,
      }));
    } catch (error) {
      console.error('❌ Orchestrator: Erro ao listar planos', error);
      return [];
    }
  }
}
