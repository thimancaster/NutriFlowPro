
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
  fat: number;
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
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED');
        throw new Error('Rate limit exceeded');
      }

      // Validate search term
      const validation = validateFoodSearch(searchTerm);
      if (!validation.isValid) {
        await logSecurityEvent(context.userId, 'INVALID_SEARCH_TERM');
        throw new Error(validation.error || 'Invalid search term');
      }

      // Rate limiting for search
      const searchRateLimit = await checkRateLimit(context.userId);
      if (!searchRateLimit) {
        await logSecurityEvent(context.userId, 'SEARCH_RATE_LIMIT_EXCEEDED');
        throw new Error('Search rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fat')
        .ilike('name', `%${validation.sanitizedTerm}%`)
        .limit(limit);

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR');
        throw error;
      }

      // Log successful search
      await logSecurityEvent(context.userId, 'FOOD_SEARCH_SUCCESS');

      return data || [];
    } catch (error) {
      await logSecurityEvent(context.userId, 'FOOD_SEARCH_ERROR');
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
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED');
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fat')
        .eq('id', foodId)
        .single();

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR');
        throw error;
      }

      return data;
    } catch (error) {
      await logSecurityEvent(context.userId, 'GET_FOOD_ERROR');
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
        await logSecurityEvent(context.userId, 'RATE_LIMIT_EXCEEDED');
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('foods')
        .select('id, name, category, calories, protein, carbs, fat')
        .eq('category', category)
        .limit(limit);

      if (error) {
        await logSecurityEvent(context.userId, 'DATABASE_ERROR');
        throw error;
      }

      return data || [];
    } catch (error) {
      await logSecurityEvent(context.userId, 'GET_FOODS_BY_CATEGORY_ERROR');
      throw error;
    }
  }
}

export const securedFoodService = SecuredFoodService.getInstance();
export default securedFoodService;
