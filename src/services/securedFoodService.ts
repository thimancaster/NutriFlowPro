
import { supabase } from '@/integrations/supabase/client';
import { validateFoodSearch } from '@/utils/validation';
import { checkRateLimit, logSecurityEvent } from '@/utils/security/advancedSecurityUtils';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface SecurityContext {
  userId: string;
  sessionId: string;
  ipAddress?: string;
}

class SecuredFoodService {
  private static instance: SecuredFoodService;
  
  public static getInstance(): SecuredFoodService {
    if (!SecuredFoodService.instance) {
      SecuredFoodService.instance = new SecuredFoodService();
    }
    return SecuredFoodService.instance;
  }

  async searchFoods(
    searchTerm: string, 
    context: SecurityContext,
    limit: number = 50
  ): Promise<SearchResult[]> {
    try {
      // Rate limiting
      const rateLimitCheck = await checkRateLimit(context.userId);
      if (!rateLimitCheck) {
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED', { 
          action: 'food_search',
          searchTerm: searchTerm.substring(0, 100)
        });
        throw new Error('Rate limit exceeded');
      }

      // Validate search term
      const validation = validateFoodSearch(searchTerm);
      if (!validation.isValid) {
        await logSecurityEvent(context.userId, 'INVALID_SEARCH_TERM', { 
          searchTerm: searchTerm.substring(0, 100),
          error: validation.error
        });
        throw new Error(validation.error || 'Invalid search term');
      }

      // Rate limiting for search
      const searchRateLimit = await checkRateLimit(context.userId);
      if (!searchRateLimit) {
        await logSecurityEvent(context.userId, 'SEARCH_RATE_LIMIT_EXCEEDED', { 
          action: 'food_search'
        });
        throw new Error('Search rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .ilike('name', `%${validation.sanitizedTerm}%`)
        .limit(limit);

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR', { 
          action: 'food_search',
          error: error.message
        });
        throw error;
      }

      // Log successful search
      await logSecurityEvent(context.userId, 'FOOD_SEARCH_SUCCESS', { 
        searchTerm: validation.sanitizedTerm,
        resultCount: data?.length || 0
      });

      return data || [];
    } catch (error) {
      await logSecurityEvent(context.userId, 'FOOD_SEARCH_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getFoodById(
    foodId: string, 
    context: SecurityContext
  ): Promise<SearchResult | null> {
    try {
      const rateLimitCheck = await checkRateLimit(context.userId);
      if (!rateLimitCheck) {
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED', { 
          action: 'get_food_by_id'
        });
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .eq('id', foodId)
        .single();

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR', { 
          action: 'get_food_by_id',
          error: error.message
        });
        throw error;
      }

      return data;
    } catch (error) {
      await logSecurityEvent(context.userId, 'GET_FOOD_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getFoodsByCategory(
    category: string, 
    context: SecurityContext,
    limit: number = 100
  ): Promise<SearchResult[]> {
    try {
      const rateLimitCheck = await checkRateLimit(context.userId);
      if (!rateLimitCheck) {
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED', { 
          action: 'get_foods_by_category'
        });
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g')
        .eq('category', category)
        .limit(limit);

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR', { 
          action: 'get_foods_by_category',
          error: error.message
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      await logSecurityEvent(context.userId, 'GET_FOODS_BY_CATEGORY_ERROR', { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

export const securedFoodService = SecuredFoodService.getInstance();
export default securedFoodService;
