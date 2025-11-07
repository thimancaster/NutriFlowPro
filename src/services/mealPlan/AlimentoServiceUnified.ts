/**
 * ALIMENTO SERVICE UNIFIED
 * Serviço único para busca e gerenciamento de alimentos
 */

import { supabase } from '@/integrations/supabase/client';
import { MealType } from '@/types/mealPlanTypes';

export interface AlimentoV2 {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  kcal_por_referencia: number;
  ptn_g_por_referencia: number;
  cho_g_por_referencia: number;
  lip_g_por_referencia: number;
  peso_referencia_g: number;
  medida_padrao_referencia: string;
  tipo_refeicao_sugerida?: string[];
  keywords?: string[];
  popularidade?: number;
}

export interface SearchFilters {
  categoria?: string;
  mealType?: MealType;
  maxCalories?: number;
  minProtein?: number;
}

export class AlimentoServiceUnified {
  /**
   * Busca alimentos por texto
   */
  static async searchAlimentos(
    query: string,
    filters?: SearchFilters,
    limit: number = 20
  ): Promise<AlimentoV2[]> {
    try {
      let supabaseQuery = supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .ilike('nome', `%${query}%`)
        .order('popularidade', { ascending: false })
        .limit(limit);

      if (filters?.categoria) {
        supabaseQuery = supabaseQuery.eq('categoria', filters.categoria);
      }

      if (filters?.mealType) {
        supabaseQuery = supabaseQuery.contains('tipo_refeicao_sugerida', [filters.mealType]);
      }

      if (filters?.maxCalories) {
        supabaseQuery = supabaseQuery.lte('kcal_por_referencia', filters.maxCalories);
      }

      const { data, error } = await supabaseQuery;

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar alimentos:', error);
      return [];
    }
  }

  /**
   * Busca alimentos mais usados pelo usuário
   */
  static async getMostUsed(userId: string, limit: number = 10): Promise<AlimentoV2[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_most_used_foods', {
        p_user_id: userId,
        p_limit: limit
      });

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar alimentos mais usados:', error);
      return [];
    }
  }

  /**
   * Busca sugestões de alimentos para uma refeição específica
   */
  static async getSuggestionsForMeal(
    mealType: MealType,
    targetCalories?: number,
    limit: number = 20
  ): Promise<AlimentoV2[]> {
    try {
      let query = supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .contains('tipo_refeicao_sugerida', [mealType])
        .order('popularidade', { ascending: false })
        .limit(limit);

      if (targetCalories) {
        // Buscar alimentos com calorias apropriadas (±50% do target)
        const minCal = targetCalories * 0.5;
        const maxCal = targetCalories * 1.5;
        query = query.gte('kcal_por_referencia', minCal).lte('kcal_por_referencia', maxCal);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar sugestões:', error);
      return [];
    }
  }

  /**
   * Busca alimentos culturalmente apropriados para uma refeição
   */
  static async getCulturallyAppropriate(mealType: MealType): Promise<AlimentoV2[]> {
    try {
      // Buscar alimentos apropriados para o tipo de refeição
      const { data, error } = await supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .contains('tipo_refeicao_sugerida', [mealType])
        .order('popularidade', { ascending: false })
        .limit(50); // Buscar mais opções para variedade

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar alimentos culturais:', error);
      return [];
    }
  }

  /**
   * Busca alimentos por categoria
   */
  static async getByCategory(categoria: string, limit: number = 20): Promise<AlimentoV2[]> {
    try {
      const { data, error } = await supabase
        .from('alimentos_v2')
        .select('*')
        .eq('ativo', true)
        .eq('categoria', categoria)
        .order('popularidade', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
      
    } catch (error) {
      console.error('❌ Erro ao buscar por categoria:', error);
      return [];
    }
  }

  /**
   * Busca um alimento por ID
   */
  static async getById(id: string): Promise<AlimentoV2 | null> {
    try {
      const { data, error } = await supabase
        .from('alimentos_v2')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao buscar alimento:', error);
      return null;
    }
  }

  /**
   * Registra uso de um alimento
   */
  static async recordUsage(userId: string, alimentoId: string): Promise<void> {
    try {
      await supabase
        .from('food_usage_history')
        .insert({
          user_id: userId,
          alimento_id: alimentoId,
        });

      // Incrementar popularidade (implementar RPC depois se necessário)
      
    } catch (error) {
      console.error('❌ Erro ao registrar uso:', error);
    }
  }
}
