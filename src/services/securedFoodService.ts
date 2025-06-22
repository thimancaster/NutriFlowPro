
import { supabase } from "@/integrations/supabase/client";
import { sanitizeSearchQuery, checkRateLimit, logSecurityEvent } from "@/utils/security/advancedSecurityUtils";

export interface SecureFoodSearch {
  query: string;
  category?: string;
  limit?: number;
}

export const searchFoodsSecurely = async (params: SecureFoodSearch) => {
  const userFingerprint = localStorage.getItem('session_fingerprint') || 'anonymous';
  
  // Rate limiting check
  if (!checkRateLimit(`food_search_${userFingerprint}`, 30, 60000)) {
    await logSecurityEvent('rate_limit_exceeded', { action: 'food_search' });
    throw new Error('Muitas consultas. Tente novamente em alguns minutos.');
  }

  // Input sanitization
  const sanitizedQuery = sanitizeSearchQuery(params.query);
  const sanitizedCategory = params.category ? sanitizeSearchQuery(params.category) : undefined;
  const limit = Math.min(Math.max(params.limit || 20, 1), 100); // Limit between 1-100

  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    throw new Error('Consulta deve ter pelo menos 2 caracteres válidos');
  }

  try {
    // Use parameterized query to prevent SQL injection
    let queryBuilder = supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${sanitizedQuery}%`)
      .limit(limit);

    if (sanitizedCategory) {
      queryBuilder = queryBuilder.eq('category', sanitizedCategory);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      await logSecurityEvent('food_search_error', { 
        error: error.message,
        query: sanitizedQuery 
      });
      throw error;
    }

    // Log successful search for monitoring
    await logSecurityEvent('food_search_success', { 
      query: sanitizedQuery,
      results_count: data?.length || 0 
    });

    return data || [];
  } catch (error) {
    await logSecurityEvent('food_search_exception', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      query: sanitizedQuery 
    });
    throw error;
  }
};

// Secure food details fetch
export const getFoodDetailsSecurely = async (foodId: string) => {
  const userFingerprint = localStorage.getItem('session_fingerprint') || 'anonymous';
  
  // Rate limiting
  if (!checkRateLimit(`food_details_${userFingerprint}`, 50, 60000)) {
    await logSecurityEvent('rate_limit_exceeded', { action: 'food_details' });
    throw new Error('Muitas consultas. Tente novamente em alguns minutos.');
  }

  // Validate food ID format (should be UUID or number)
  if (!/^[a-f\d-]{36}$|^\d+$/.test(foodId)) {
    await logSecurityEvent('invalid_food_id', { food_id: foodId });
    throw new Error('ID do alimento inválido');
  }

  try {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', foodId)
      .single();

    if (error) {
      await logSecurityEvent('food_details_error', { 
        error: error.message,
        food_id: foodId 
      });
      throw error;
    }

    return data;
  } catch (error) {
    await logSecurityEvent('food_details_exception', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      food_id: foodId 
    });
    throw error;
  }
};
