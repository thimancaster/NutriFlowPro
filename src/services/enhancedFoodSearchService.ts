import { supabase } from '@/integrations/supabase/client';
import { AlimentoV2 } from '@/types/alimento';
import { normalizeText, matchesQuery, calculateSimilarity } from '@/utils/textNormalization';

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
  sortBy?: 'name' | 'calories' | 'protein' | 'popularity' | 'usage' | 'relevance';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  foods: AlimentoV2[];
  total: number;
  hasMore: boolean;
}

/**
 * Enhanced food search using Full-Text Search with pg_trgm
 * Uses the search_alimentos_fulltext function for efficient searching
 */
export async function searchFoodsEnhanced(
  filters: EnhancedSearchFilters,
  userId?: string
): Promise<SearchResult> {
  try {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const searchTerm = filters.query?.trim() || '';
    
    // Use the new full-text search function
    const { data, error } = await supabase.rpc('search_alimentos_fulltext', {
      search_query: searchTerm || '',
      search_category: filters.category || null,
      search_meal_type: filters.mealTime || null,
      max_results: Math.min(limit + offset + 50, 500) // Get extra for filtering
    });

    if (error) {
      console.error('Full-text search error:', error);
      // Fallback to basic search if full-text fails
      return fallbackSearch(filters, limit, offset);
    }

    let foods = (data || []).map((item: any) => ({
      id: item.id,
      nome: item.nome,
      categoria: item.categoria,
      subcategoria: item.subcategoria,
      medida_padrao_referencia: item.medida_padrao_referencia,
      peso_referencia_g: Number(item.peso_referencia_g),
      kcal_por_referencia: Number(item.kcal_por_referencia),
      ptn_g_por_referencia: Number(item.ptn_g_por_referencia),
      cho_g_por_referencia: Number(item.cho_g_por_referencia),
      lip_g_por_referencia: Number(item.lip_g_por_referencia),
      fibra_g_por_referencia: item.fibra_g_por_referencia ? Number(item.fibra_g_por_referencia) : null,
      sodio_mg_por_referencia: item.sodio_mg_por_referencia ? Number(item.sodio_mg_por_referencia) : null,
      popularidade: item.popularidade,
      keywords: item.keywords,
      tipo_refeicao_sugerida: item.tipo_refeicao_sugerida,
      descricao_curta: item.descricao_curta,
      preparo_sugerido: item.preparo_sugerido,
      ativo: true,
      created_at: '',
      updated_at: '',
      fonte: null,
      observacoes: null,
    })) as AlimentoV2[];

    // Apply additional filters
    if (filters.maxCalories) {
      foods = foods.filter(f => f.kcal_por_referencia <= filters.maxCalories!);
    }

    if (filters.minProtein) {
      foods = foods.filter(f => f.ptn_g_por_referencia >= filters.minProtein!);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'calories':
        foods.sort((a, b) => a.kcal_por_referencia - b.kcal_por_referencia);
        break;
      case 'protein':
        foods.sort((a, b) => b.ptn_g_por_referencia - a.ptn_g_por_referencia);
        break;
      case 'name':
        foods.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      // 'relevance' and 'popularity' are already sorted by the function
    }

    // Remove duplicates by nome (keeping the first occurrence)
    const seen = new Set<string>();
    foods = foods.filter(food => {
      const normalizedName = food.nome.toLowerCase().trim();
      if (seen.has(normalizedName)) {
        return false;
      }
      seen.add(normalizedName);
      return true;
    });

    const total = foods.length;
    const paginatedFoods = foods.slice(offset, offset + limit);

    return {
      foods: paginatedFoods,
      total,
      hasMore: total > offset + limit,
    };
  } catch (error) {
    console.error('Enhanced food search error:', error);
    return fallbackSearch(filters, filters.limit || 50, filters.offset || 0);
  }
}

/**
 * Fallback search using ILIKE for cases where full-text search fails
 */
async function fallbackSearch(
  filters: EnhancedSearchFilters,
  limit: number,
  offset: number
): Promise<SearchResult> {
  const searchTerm = filters.query?.trim() || '';
  
  let query = supabase
    .from('alimentos_v2')
    .select('*', { count: 'exact' })
    .eq('ativo', true);

  if (searchTerm) {
    query = query.or(`nome.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
  }

  if (filters.category) {
    query = query.eq('categoria', filters.category);
  }

  if (filters.mealTime) {
    query = query.contains('tipo_refeicao_sugerida', [filters.mealTime]);
  }

  if (filters.maxCalories) {
    query = query.lte('kcal_por_referencia', filters.maxCalories);
  }

  if (filters.minProtein) {
    query = query.gte('ptn_g_por_referencia', filters.minProtein);
  }

  query = query
    .order('popularidade', { ascending: false, nullsFirst: false })
    .order('nome', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    foods: data || [],
    total: count || 0,
    hasMore: (count || 0) > offset + limit,
  };
}

/**
 * Calculate relevance score for sorting search results
 */
function calculateRelevanceScore(food: AlimentoV2, normalizedQuery: string): number {
  let score = 0;
  
  const normalizedName = normalizeText(food.nome);
  const normalizedCategory = normalizeText(food.categoria || '');
  const normalizedSubcategory = normalizeText(food.subcategoria || '');
  
  // Exact name match
  if (normalizedName === normalizedQuery) {
    score += 100;
  }
  // Name starts with query
  else if (normalizedName.startsWith(normalizedQuery)) {
    score += 80;
  }
  // Name contains query as word
  else if (normalizedName.split(' ').some(word => word === normalizedQuery)) {
    score += 70;
  }
  // Name contains query
  else if (normalizedName.includes(normalizedQuery)) {
    score += 50;
  }
  
  // Category match
  if (normalizedCategory.includes(normalizedQuery)) {
    score += 20;
  }
  
  // Subcategory match
  if (normalizedSubcategory.includes(normalizedQuery)) {
    score += 15;
  }
  
  // Keywords match
  const normalizedKeywords = (food.keywords || []).map(k => normalizeText(k));
  if (normalizedKeywords.some(k => k.includes(normalizedQuery))) {
    score += 30;
  }
  
  // Popularity boost
  score += Math.min((food.popularidade || 0) / 10, 10);
  
  return score;
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
