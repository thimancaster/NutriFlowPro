
import { supabase } from '@/integrations/supabase/client';
import { validateFoodSearch } from '@/utils/validation';
import { checkRateLimit, logSecurityEvent } from '@/utils/security/advancedSecurityUtils';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
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
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'RATE_LIMIT_EXCEEDED',
          event_data: { action: 'search_foods' }
        });
        throw new Error('Rate limit exceeded');
      }

      // Validate search term
      const validation = validateFoodSearch(searchTerm);
      if (!validation.isValid) {
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'INVALID_SEARCH_TERM',
          event_data: { searchTerm, error: validation.error }
        });
        throw new Error(validation.error || 'Invalid search term');
      }

      // Rate limiting for search
      const searchRateLimit = await checkRateLimit(context.userId);
      if (!searchRateLimit) {
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'SEARCH_RATE_LIMIT_EXCEEDED',
          event_data: { action: 'search_foods' }
        });
        throw new Error('Search rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fats')
        .ilike('name', `%${validation.sanitizedTerm}%`)
        .limit(limit);

      if (error) {
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'DATABASE_ERROR',
          event_data: { error: error.message, action: 'search_foods' }
        });
        throw error;
      }

      // Log successful search
      await logSecurityEvent({
        user_id: context.userId,
        event_type: 'FOOD_SEARCH_SUCCESS',
        event_data: { searchTerm: validation.sanitizedTerm, resultCount: data?.length || 0 }
      });

      return data || [];
    } catch (error) {
      await logSecurityEvent({
        user_id: context.userId,
        event_type: 'FOOD_SEARCH_ERROR',
        event_data: { error: error instanceof Error ? error.message : 'Unknown error' }
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
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'RATE_LIMIT_EXCEEDED',
          event_data: { action: 'get_food_by_id' }
        });
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fats')
        .eq('id', foodId)
        .single();

      if (error) {
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'DATABASE_ERROR',
          event_data: { error: error.message, action: 'get_food_by_id' }
        });
        throw error;
      }

      return data;
    } catch (error) {
      await logSecurityEvent({
        user_id: context.userId,
        event_type: 'GET_FOOD_ERROR',
        event_data: { error: error instanceof Error ? error.message : 'Unknown error' }
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
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'RATE_LIMIT_EXCEEDED',
          event_data: { action: 'get_foods_by_category' }
        });
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fats')
        .eq('category', category)
        .limit(limit);

      if (error) {
        await logSecurityEvent({
          user_id: context.userId,
          event_type: 'DATABASE_ERROR',
          event_data: { error: error.message, action: 'get_foods_by_category' }
        });
        throw error;
      }

      return data || [];
    } catch (error) {
      await logSecurityEvent({
        user_id: context.userId,
        event_type: 'GET_FOODS_BY_CATEGORY_ERROR',
        event_data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }
}

export const securedFoodService = SecuredFoodService.getInstance();
export default securedFoodService;
