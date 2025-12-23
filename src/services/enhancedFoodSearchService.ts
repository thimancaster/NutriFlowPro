/**
 * ENHANCED FOOD SEARCH SERVICE - SERVIÇO ÚNICO DE BUSCA DE ALIMENTOS
 * 
 * Este é o ÚNICO ponto de entrada para busca de alimentos no sistema.
 * Todas as outras partes do sistema devem usar este serviço.
 * 
 * Features:
 * - Full-text search com pg_trgm
 * - Cache local agressivo
 * - Debounce otimizado
 * - Paginação virtual
 */

import { supabase } from '@/integrations/supabase/client';
import { AlimentoV2 } from '@/types/alimento';
import { normalizeText } from '@/utils/textNormalization';

// Re-exportar para compatibilidade
export type { AlimentoV2 };

// ==================== CACHE CONFIGURATION ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, CacheEntry<SearchResult>>();
const categoryCache = new Map<string, CacheEntry<Array<{ name: string; count: number }>>>();

function getCached<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
}, CACHE_TTL);

// ==================== TYPES ====================

export interface EnhancedSearchFilters {
  query?: string;
  category?: string;
  mealTime?: string; // 'cafe_da_manha', 'almoco', 'jantar', 'lanche'
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

// ==================== MAIN SEARCH FUNCTION ====================

/**
 * Enhanced food search using Full-Text Search with unaccent
 * Uses aggressive caching for performance
 * A busca agora suporta acentos: "pao" encontra "Pão"
 */
export async function searchFoodsEnhanced(
  filters: EnhancedSearchFilters,
  userId?: string
): Promise<SearchResult> {
  const cacheKey = JSON.stringify({ ...filters, userId });
  const cached = getCached(searchCache, cacheKey);
  if (cached) {
    console.log('[SEARCH] Cache hit:', cacheKey.slice(0, 50));
    return cached;
  }

  try {
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;
    // Normalizar a query client-side também para garantir consistência
    const searchTerm = normalizeText(filters.query?.trim() || '');
    
    console.log('[SEARCH] Searching for:', searchTerm || '(empty - showing popular)');
    
    // Use the full-text search function with unaccent support
    const { data, error } = await supabase.rpc('search_alimentos_fulltext', {
      search_query: filters.query?.trim() || '', // Enviar original, RPC normaliza
      search_category: filters.category || null,
      search_meal_type: filters.mealTime || null,
      max_results: Math.min(limit + offset + 100, 1000)
    });

    if (error) {
      console.error('[SEARCH] Full-text search error:', error);
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
        foods.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
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

    const result: SearchResult = {
      foods: paginatedFoods,
      total,
      hasMore: total > offset + limit,
    };

    // Cache the result
    setCache(searchCache, cacheKey, result);

    return result;
  } catch (error) {
    console.error('[SEARCH] Enhanced food search error:', error);
    return fallbackSearch(filters, filters.limit || 100, filters.offset || 0);
  }
}

/**
 * Fallback search using ILIKE for cases where full-text search fails
 * Usa normalização client-side para busca sem acentos
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
    // Normalizar para matching sem acentos
    const normalizedTerm = normalizeText(searchTerm);
    // Buscar tanto com termo original quanto normalizado
    query = query.or(`nome.ilike.%${normalizedTerm}%,nome.ilike.%${searchTerm}%,categoria.ilike.%${normalizedTerm}%`);
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

// ==================== ADDITIONAL FOOD FUNCTIONS ====================

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
    console.error('[SEARCH] Error getting most used foods:', error);
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
    console.error('[SEARCH] Error getting popular foods:', error);
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
    console.error('[SEARCH] Error toggling favorite:', error);
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
    console.error('[SEARCH] Error tracking food usage:', error);
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
    console.error('[SEARCH] Error finding similar foods:', error);
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
    console.error('[SEARCH] Error getting foods by category:', error);
    return [];
  }
}

/**
 * Get all unique categories with counts - CACHED
 */
export async function getFoodCategories(): Promise<Array<{ name: string; count: number }>> {
  const cacheKey = 'categories';
  const cached = getCached(categoryCache, cacheKey);
  if (cached) {
    return cached;
  }

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

    const result = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setCache(categoryCache, cacheKey, result);
    return result;
  } catch (error) {
    console.error('[SEARCH] Error getting categories:', error);
    return [];
  }
}

/**
 * Get foods by meal type
 */
export async function getFoodsByMealType(
  mealType: string,
  limit: number = 50
): Promise<AlimentoV2[]> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('ativo', true)
      .contains('tipo_refeicao_sugerida', [mealType])
      .order('popularidade', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[SEARCH] Error getting foods by meal type:', error);
    return [];
  }
}

/**
 * Get a single food by ID
 */
export async function getFoodById(id: string): Promise<AlimentoV2 | null> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[SEARCH] Error getting food by id:', error);
    return null;
  }
}

/**
 * Clear all caches (useful for testing or after data updates)
 */
export function clearFoodSearchCache(): void {
  searchCache.clear();
  categoryCache.clear();
  console.log('[SEARCH] Cache cleared');
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * Create a new food item (admin function)
 */
export async function createFood(food: Partial<AlimentoV2>): Promise<AlimentoV2 | null> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .insert({
        nome: food.nome || '',
        categoria: food.categoria || 'Outros',
        medida_padrao_referencia: food.medida_padrao_referencia || 'unidade',
        peso_referencia_g: food.peso_referencia_g || 100,
        kcal_por_referencia: food.kcal_por_referencia || 0,
        ptn_g_por_referencia: food.ptn_g_por_referencia || 0,
        cho_g_por_referencia: food.cho_g_por_referencia || 0,
        lip_g_por_referencia: food.lip_g_por_referencia || 0,
        fibra_g_por_referencia: food.fibra_g_por_referencia || null,
        sodio_mg_por_referencia: food.sodio_mg_por_referencia || null,
        tipo_refeicao_sugerida: food.tipo_refeicao_sugerida || ['any'],
        ativo: true,
        popularidade: 0,
      })
      .select()
      .single();

    if (error) throw error;
    clearFoodSearchCache();
    return data;
  } catch (error) {
    console.error('[SEARCH] Error creating food:', error);
    return null;
  }
}

/**
 * Update an existing food item (admin function)
 */
export async function updateFood(id: string, updates: Partial<AlimentoV2>): Promise<AlimentoV2 | null> {
  try {
    const { data, error } = await supabase
      .from('alimentos_v2')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    clearFoodSearchCache();
    return data;
  } catch (error) {
    console.error('[SEARCH] Error updating food:', error);
    return null;
  }
}

/**
 * Delete (deactivate) a food item (admin function)
 */
export async function deleteFood(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('alimentos_v2')
      .update({ ativo: false })
      .eq('id', id);

    if (error) throw error;
    clearFoodSearchCache();
    return true;
  } catch (error) {
    console.error('[SEARCH] Error deleting food:', error);
    return false;
  }
}
