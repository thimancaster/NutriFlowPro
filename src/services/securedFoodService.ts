
import { supabase } from "@/integrations/supabase/client";
import { sanitizeSearchQuery, checkRateLimit, logSecurityEvent } from "@/utils/security/advancedSecurityUtils";

export interface SecureFoodSearch {
  query: string;
  category?: string;
  limit?: number;
}

export interface FoodResult {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  portion_size: number;
  portion_unit: string;
}

export const searchFoodsSecurely = async (params: SecureFoodSearch): Promise<FoodResult[]> => {
  const userFingerprint = localStorage.getItem('session_fingerprint') || 'anonymous';
  
  // Rate limiting check
  if (!checkRateLimit(`food_search_${userFingerprint}`, 30, 60000)) {
    await logSecurityEvent('rate_limit_exceeded', { action: 'food_search' });
    throw new Error('Muitas consultas. Tente novamente em alguns minutos.');
  }

  // Input sanitization
  const sanitizedQuery = sanitizeSearchQuery(params.query);
  const sanitizedCategory = params.category ? sanitizeSearchQuery(params.category) : null;
  const limit = Math.min(Math.max(params.limit || 20, 1), 100);

  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    throw new Error('Consulta deve ter pelo menos 2 caracteres válidos');
  }

  try {
    // Use the new secure RPC function instead of direct table access
    const { data, error } = await supabase.rpc('search_foods_secure', {
      search_query: sanitizedQuery,
      search_category: sanitizedCategory,
      search_limit: limit
    });

    if (error) {
      await logSecurityEvent('food_search_error', { 
        error: error.message,
        query: sanitizedQuery 
      });
      throw error;
    }

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

  // Validate food ID format (should be UUID)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(foodId)) {
    await logSecurityEvent('invalid_food_id', { food_id: foodId });
    throw new Error('ID do alimento inválido');
  }

  try {
    const { data, error } = await supabase
      .from('foods_legacy')
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
