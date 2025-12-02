import { supabase } from '@/integrations/supabase/client';
import { AlimentoV2 } from '@/types/alimento';

// Re-exportar para compatibilidade
export type { AlimentoV2 };

export interface EnhancedSearchFilters {
  query?: string;
  category?: string;
  mealTime?: string; // 'cafe_manha', 'almoco', 'jantar', 'lanche'
  maxCalories?: number;
  minProtein?: number;
  favorites?: boolean;
  recent?: boolean;
  sortBy?: 'name' | 'calories' | 'protein' | 'popularity' | 'usage';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  foods: AlimentoV2[];
  total: number;
  hasMore: boolean;
}

/**
 * Enhanced food search with fuzzy matching, filters, and pagination
 */
export async function searchFoodsEnhanced(
  filters: EnhancedSearchFilters,
  userId?: string
): Promise<SearchResult> {
  try {
    let query = supabase
      .from('alimentos_v2')
      .select('*', { count: 'exact' })
      .eq('ativo', true);

    // Fuzzy text search using pg_trgm (trigram similarity)
    if (filters.query && filters.query.trim()) {
      const searchTerm = filters.query.trim();
      
      // Search in nome, categoria, subcategoria, and keywords
      query = query.or(
        `nome.ilike.%${searchTerm}%,` +
        `categoria.ilike.%${searchTerm}%,` +
        `subcategoria.ilike.%${searchTerm}%,` +
        `keywords.cs.{${searchTerm}}`
      );
    }

    // Filter by category
    if (filters.category) {
      query = query.eq('categoria', filters.category);
    }

    // Filter by meal time
    if (filters.mealTime) {
      query = query.contains('tipo_refeicao_sugerida', [filters.mealTime]);
    }

    // Filter by max calories
    if (filters.maxCalories) {
      query = query.lte('kcal_por_referencia', filters.maxCalories);
    }

    // Filter by min protein
    if (filters.minProtein) {
      query = query.gte('ptn_g_por_referencia', filters.minProtein);
    }

    // Sorting
    switch (filters.sortBy) {
      case 'calories':
        query = query.order('kcal_por_referencia', { ascending: true });
        break;
      case 'protein':
        query = query.order('ptn_g_por_referencia', { ascending: false });
        break;
      case 'popularity':
        query = query.order('popularidade', { ascending: false });
        break;
      case 'name':
      default:
        query = query.order('nome', { ascending: true });
        break;
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error searching foods:', error);
      throw error;
    }

    return {
      foods: data || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };
  } catch (error) {
    console.error('Enhanced food search error:', error);
    throw error;
  }
}

/**
 * Get user's most used foods
 */
export async function getUserMostUsedFoods(
  userId: string,
  limit: number = 20
): Promise<AlimentoV2[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_most_used_foods', {
      p_user_id: userId,
      p_limit: limit,
    });

    if (error) throw error;
    return (data || []) as AlimentoV2[];
  } catch (error) {
    console.error('Error getting most used foods:', error);
    return [];
  }
}

/**
 * Get popular foods globally
 */
export async function getPopularFoods(limit: number = 20): Promise<AlimentoV2[]> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .order('popularidade', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting popular foods:', error);
    return [];
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavoriteFood(
  userId: string,
  alimentoId: string,
  isFavorite: boolean
): Promise<boolean> {
  try {
    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorite_foods')
        .delete()
        .eq('user_id', userId)
        .eq('alimento_id', alimentoId);

      if (error) throw error;
      return false;
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorite_foods')
        .insert({
          user_id: userId,
          alimento_id: alimentoId,
        });

      if (error) throw error;
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

/**
 * Track food usage
 */
export async function trackFoodUsage(
  userId: string,
  alimentoId: string
): Promise<void> {
  try {
    await supabase.from('food_usage_history').insert({
      user_id: userId,
      alimento_id: alimentoId,
    });
  } catch (error) {
    console.error('Error tracking food usage:', error);
    // Don't throw - this is non-critical
  }
}

/**
 * Find similar foods (for substitutions)
 */
export async function findSimilarFoods(
  food: AlimentoV2,
  tolerance: number = 20 // % difference tolerance
): Promise<AlimentoV2[]> {
  try {
    const calorieRange = (food.kcal_por_referencia * tolerance) / 100;
    const proteinRange = (food.ptn_g_por_referencia * tolerance) / 100;

    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .neq('id', food.id) // Exclude the original food
      .gte('kcal_por_referencia', food.kcal_por_referencia - calorieRange)
      .lte('kcal_por_referencia', food.kcal_por_referencia + calorieRange)
      .gte('ptn_g_por_referencia', food.ptn_g_por_referencia - proteinRange)
      .lte('ptn_g_por_referencia', food.ptn_g_por_referencia + proteinRange)
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error finding similar foods:', error);
    return [];
  }
}

/**
 * Get foods by category
 */
export async function getFoodsByCategory(category: string): Promise<AlimentoV2[]> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .eq('categoria', category)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting foods by category:', error);
    return [];
  }
}

/**
 * Get all unique categories with counts
 */
export async function getFoodCategories(): Promise<
  Array<{ name: string; count: number }>
> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('categoria')
      .eq('ativo', true);

    if (error) throw error;

    // Count occurrences
    const categoryCount = (data || []).reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}
