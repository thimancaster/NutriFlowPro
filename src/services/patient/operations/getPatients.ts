
import { supabase } from '@/integrations/supabase/client';
import { PatientFilters } from '@/types';

/**
 * Get patients for a user with optional filters
 * @param userId User ID to fetch patients for
 * @param filters Optional filters like search, status, pagination, sorting
 * @returns Promise with patients data and count
 */
export const getPatients = async (userId: string, filters: PatientFilters) => {
  try {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    // Apply search filter
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    
    // Apply date filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      const order = filters.sortOrder?.toLowerCase() === 'desc' ? true : false;
      query = query.order(filters.sortBy, { ascending: !order });
    }
    
    // Apply pagination
    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      data: data || [],
      count: count || 0
    };
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch patients',
      data: [],
      count: 0
    };
  }
};
