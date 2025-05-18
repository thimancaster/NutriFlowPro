
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

// Define simple types to avoid excessive type instantiation
type BasicPatientData = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  status?: string;
  created_at?: string;
  // Use a simple indexer for additional properties
  [key: string]: any;
};

type PatientResponse = {
  success: boolean;
  data?: BasicPatientData[];
  error?: string;
  count?: number;
};

/**
 * Get list of patients with optional filtering
 */
export const getPatients = async (
  userId: string,
  options?: {
    status?: 'active' | 'archived' | 'all';
    limit?: number;
    from?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<PatientResponse> => {
  try {
    // Create query without chaining to avoid deep instantiation
    let queryBuilder = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    // Apply user ID filter
    queryBuilder = queryBuilder.eq('user_id', userId);
    
    // Apply status filter if provided
    if (options?.status && options.status !== 'all') {
      queryBuilder = queryBuilder.eq('status', options.status);
    }

    // Apply search filter - use simple name search only
    if (options?.search) {
      queryBuilder = queryBuilder.ilike('name', `%${options.search}%`);
    }

    // Apply date filters
    if (options?.dateFrom) {
      queryBuilder = queryBuilder.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      queryBuilder = queryBuilder.lte('created_at', options.dateTo);
    }

    // Apply ordering
    if (options?.orderBy) {
      const direction = options?.orderDirection || 'asc';
      queryBuilder = queryBuilder.order(options.orderBy, { ascending: direction === 'asc' });
    } else {
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options?.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }

    if (options?.from !== undefined) {
      const fromValue = options.from;
      const limitValue = options.limit || 10;
      const toValue = fromValue + limitValue - 1;
      queryBuilder = queryBuilder.range(fromValue, toValue);
    }

    // Execute the query
    const { data, error, count } = await queryBuilder;

    if (error) {
      throw error;
    }

    // Return the result with explicit type casting
    return {
      success: true,
      data: data as BasicPatientData[],
      count
    };
  } catch (error) {
    console.error('Error fetching patients:', (error as PostgrestError).message);
    return {
      success: false,
      error: (error as PostgrestError).message
    };
  }
};
