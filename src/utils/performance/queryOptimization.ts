
/**
 * SQL Query Optimization utilities
 * Phase 2: Performance improvements
 */

import { supabase } from '@/integrations/supabase/client';

export class QueryOptimizer {
  private static queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  /**
   * Optimized patient query with selective fields
   */
  static async getOptimizedPatients(userId: string, limit = 10, offset = 0) {
    const cacheKey = `patients_${userId}_${limit}_${offset}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const startTime = performance.now();
    
    // Use index-optimized query with minimal fields
    const { data, error, count } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        email,
        phone,
        birth_date,
        status,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active') // Use index
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const queryTime = performance.now() - startTime;
    
    const result = {
      data: data || [],
      count: count || 0,
      queryTime,
      cached: false
    };

    // Cache for 5 minutes
    this.setCachedResult(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  }

  /**
   * Optimized calculation history query
   */
  static async getOptimizedCalculationHistory(patientId: string, limit = 5) {
    const cacheKey = `calc_history_${patientId}_${limit}`;
    const cached = this.getCachedResult(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('calculation_history')
      .select(`
        id,
        calculation_date,
        tmb,
        get,
        vet,
        protein_g,
        carbs_g,
        fat_g,
        consultation_number
      `)
      .eq('patient_id', patientId)
      .order('consultation_number', { ascending: false })
      .limit(limit);

    const result = { data: data || [], error };
    
    // Cache for 10 minutes
    this.setCachedResult(cacheKey, result, 10 * 60 * 1000);
    
    return result;
  }

  private static getCachedResult(key: string) {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return { ...cached.data, cached: true };
    }
    this.queryCache.delete(key);
    return null;
  }

  private static setCachedResult(key: string, data: any, ttl: number) {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear cache when needed
   */
  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.queryCache.keys()) {
        if (key.includes(pattern)) {
          this.queryCache.delete(key);
        }
      }
    } else {
      this.queryCache.clear();
    }
  }
}
