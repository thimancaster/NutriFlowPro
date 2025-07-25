
import { supabase } from '@/integrations/supabase/client';
import { auditLogService } from '@/services/auditLogService';
import { checkRateLimit, logSecurityEvent } from '@/utils/security/advancedSecurityUtils';

export const securedFoodService = {
  async searchFoods(query: string, userId: string) {
    // Rate limiting check
    if (!checkRateLimit(userId)) {
      throw new Error('Too many requests');
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(50);

      if (error) throw error;

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'food_search',
        event_data: {
          query,
          results_count: data?.length || 0,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error searching foods:', error);
      return { success: false, error: error as Error };
    }
  },

  async getFoodById(foodId: string, userId: string) {
    // Rate limiting check
    if (!checkRateLimit(userId)) {
      throw new Error('Too many requests');
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single();

      if (error) throw error;

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'food_access',
        event_data: {
          food_id: foodId,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error getting food:', error);
      return { success: false, error: error as Error };
    }
  },

  async createFood(foodData: any, userId: string) {
    // Rate limiting check
    if (!checkRateLimit(userId)) {
      throw new Error('Too many requests');
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .insert([{ ...foodData, created_by: userId }])
        .select()
        .single();

      if (error) throw error;

      // Log security event
      await logSecurityEvent({
        user_id: userId,
        event_type: 'food_created',
        event_data: {
          food_id: data.id,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating food:', error);
      return { success: false, error: error as Error };
    }
  },

  async updateFood(foodId: string, foodData: any, userId: string) {
    // Rate limiting check
    if (!checkRateLimit(userId)) {
      throw new Error('Too many requests');
    }

    try {
      const { data, error } = await supabase
        .from('foods')
        .update(foodData)
        .eq('id', foodId)
        .eq('created_by', userId)
        .select()
        .single();

      if (error) throw error;

      await logSecurityEvent({
        user_id: userId,
        event_type: 'food_updated',
        event_data: {
          food_id: foodId,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating food:', error);
      return { success: false, error: error as Error };
    }
  },

  async deleteFood(foodId: string, userId: string) {
    // Rate limiting check
    if (!checkRateLimit(userId)) {
      throw new Error('Too many requests');
    }

    try {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', foodId)
        .eq('created_by', userId);

      if (error) throw error;

      await logSecurityEvent({
        user_id: userId,
        event_type: 'food_deleted',
        event_data: {
          food_id: foodId,
          timestamp: new Date().toISOString()
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting food:', error);
      return { success: false, error: error as Error };
    }
  }
};
