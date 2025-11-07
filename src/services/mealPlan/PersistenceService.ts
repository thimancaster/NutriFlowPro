/**
 * PERSISTENCE SERVICE - SERVIÇO UNIFICADO DE PERSISTÊNCIA
 * Gerencia salvamento, versionamento e histórico de planos alimentares
 */

import { supabase } from '@/integrations/supabase/client';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';

export interface MealPlanVersion {
  id: string;
  meal_plan_id: string;
  version_number: number;
  snapshot_data: any;
  created_by?: string;
  created_at: string;
  change_summary?: string;
}

export interface MealPlanChange {
  id: string;
  meal_plan_id: string;
  version_from: number;
  version_to: number;
  change_type: string;
  change_data: any;
  changed_by?: string;
  changed_at: string;
}

export interface SaveOptions {
  createVersion?: boolean;
  changeSummary?: string;
  trackChanges?: boolean;
}

export class PersistenceService {
  /**
   * Salva um novo plano alimentar com versionamento automático
   */
  static async saveMealPlan(
    plan: ConsolidatedMealPlan,
    options: SaveOptions = {}
  ): Promise<string> {
    const { createVersion = true } = options;

    try {
      console.log('💾 PersistenceService: Salvando plano...', plan.id ? 'UPDATE' : 'CREATE');

      // Se o plano já tem ID, é uma atualização
      if (plan.id) {
        return await this.updateMealPlan(plan, options);
      }

      // Criar novo plano
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: plan.user_id,
          patient_id: plan.patient_id,
          calculation_id: plan.calculation_id,
          date: plan.date || new Date().toISOString().split('T')[0],
          total_calories: plan.total_calories,
          total_protein: plan.total_protein,
          total_carbs: plan.total_carbs,
          total_fats: plan.total_fats,
          notes: plan.notes,
          meals: JSON.parse(JSON.stringify(plan.meals)), // Convert to JSON
          version: 1,
          is_active: true,
        } as any)
        .select()
        .single();

      if (mealPlanError) throw mealPlanError;
      if (!mealPlanData) throw new Error('Nenhum plano criado');

      const mealPlanId = mealPlanData.id;

      // Salvar meal_plan_items para queries mais eficientes
      await this.saveMealPlanItems(mealPlanId, plan.meals);

      console.log('✅ PersistenceService: Plano salvo com sucesso', mealPlanId);
      return mealPlanId;
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao salvar plano', error);
      throw error;
    }
  }

  /**
   * Atualiza um plano existente com versionamento automático
   */
  static async updateMealPlan(
    plan: ConsolidatedMealPlan,
    options: SaveOptions = {}
  ): Promise<string> {
    const { changeSummary } = options;

    try {
      console.log('🔄 PersistenceService: Atualizando plano...', plan.id);

      // Atualizar meal_plan (trigger automático cria versão)
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: plan.total_calories,
          total_protein: plan.total_protein,
          total_carbs: plan.total_carbs,
          total_fats: plan.total_fats,
          notes: plan.notes,
          meals: JSON.parse(JSON.stringify(plan.meals)) as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', plan.id);

      if (updateError) throw updateError;

      // Atualizar meal_plan_items
      await this.updateMealPlanItems(plan.id, plan.meals);

      console.log('✅ PersistenceService: Plano atualizado com sucesso');
      return plan.id;
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao atualizar plano', error);
      throw error;
    }
  }

  /**
   * Salva items do plano para queries eficientes
   */
  private static async saveMealPlanItems(
    mealPlanId: string,
    meals: any[]
  ): Promise<void> {
    const items = meals.flatMap((meal, mealIndex) =>
      meal.foods.map((food: any, foodIndex: number) => ({
        meal_plan_id: mealPlanId,
        meal_type: meal.type || `meal_${mealIndex}`,
        food_id: food.id || null,
        food_name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fat,
        order_index: foodIndex,
      }))
    );

    if (items.length > 0) {
      const { error } = await supabase
        .from('meal_plan_items')
        .insert(items);

      if (error) throw error;
    }
  }

  /**
   * Atualiza items do plano (remove todos e recria)
   */
  private static async updateMealPlanItems(
    mealPlanId: string,
    meals: any[]
  ): Promise<void> {
    // Remove items existentes
    await supabase
      .from('meal_plan_items')
      .delete()
      .eq('meal_plan_id', mealPlanId);

    // Cria novos items
    await this.saveMealPlanItems(mealPlanId, meals);
  }

  /**
   * Busca histórico de versões de um plano
   */
  static async getVersionHistory(mealPlanId: string): Promise<MealPlanVersion[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_versions')
        .select('*')
        .eq('meal_plan_id', mealPlanId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao buscar histórico', error);
      return [];
    }
  }

  /**
   * Busca mudanças específicas entre versões
   */
  static async getChangesHistory(mealPlanId: string): Promise<MealPlanChange[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plan_changes')
        .select('*')
        .eq('meal_plan_id', mealPlanId)
        .order('changed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao buscar mudanças', error);
      return [];
    }
  }

  /**
   * Restaura uma versão específica do plano
   */
  static async restoreVersion(
    mealPlanId: string,
    versionNumber: number
  ): Promise<void> {
    try {
      console.log(`🔄 PersistenceService: Restaurando versão ${versionNumber}...`);

      const { data, error } = await supabase.rpc('restore_meal_plan_version', {
        p_meal_plan_id: mealPlanId,
        p_version_number: versionNumber,
      });

      if (error) throw error;

      console.log('✅ PersistenceService: Versão restaurada com sucesso');
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao restaurar versão', error);
      throw error;
    }
  }

  /**
   * Registra uma mudança específica
   */
  static async trackChange(
    mealPlanId: string,
    versionFrom: number,
    versionTo: number,
    changeType: string,
    changeData: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('meal_plan_changes')
        .insert({
          meal_plan_id: mealPlanId,
          version_from: versionFrom,
          version_to: versionTo,
          change_type: changeType,
          change_data: changeData,
        });

      if (error) throw error;
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao registrar mudança', error);
    }
  }

  /**
   * Busca versão atual do plano
   */
  static async getCurrentVersion(mealPlanId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('version')
        .eq('id', mealPlanId)
        .single();

      if (error) throw error;
      return data?.version || 1;
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao buscar versão', error);
      return 1;
    }
  }

  /**
   * Compara duas versões e retorna as diferenças
   */
  static async compareVersions(
    mealPlanId: string,
    version1: number,
    version2: number
  ): Promise<any> {
    try {
      const { data: v1Data } = await supabase
        .from('meal_plan_versions')
        .select('snapshot_data')
        .eq('meal_plan_id', mealPlanId)
        .eq('version_number', version1)
        .single();

      const { data: v2Data } = await supabase
        .from('meal_plan_versions')
        .select('snapshot_data')
        .eq('meal_plan_id', mealPlanId)
        .eq('version_number', version2)
        .single();

      if (!v1Data || !v2Data) {
        throw new Error('Versões não encontradas');
      }

      const snap1 = v1Data.snapshot_data as any;
      const snap2 = v2Data.snapshot_data as any;

      // Comparação simples (pode ser expandida)
      return {
        version1: snap1,
        version2: snap2,
        diff: {
          calories: (snap2.total_calories || 0) - (snap1.total_calories || 0),
          protein: (snap2.total_protein || 0) - (snap1.total_protein || 0),
          carbs: (snap2.total_carbs || 0) - (snap1.total_carbs || 0),
          fats: (snap2.total_fats || 0) - (snap1.total_fats || 0),
        },
      };
    } catch (error) {
      console.error('❌ PersistenceService: Erro ao comparar versões', error);
      throw error;
    }
  }
}
