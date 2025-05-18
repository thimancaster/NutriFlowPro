
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
    // Manually construct the query to avoid chaining complexity
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters as separate operations to avoid complex chaining
    query = query.eq('user_id', userId);
    
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    if (options?.search) {
      query = query.ilike('name', `%${options.search}%`);
    }

    if (options?.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    // Apply ordering
    if (options?.orderBy) {
      const direction = options?.orderDirection || 'asc';
      query = query.order(options.orderBy, { ascending: direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.from !== undefined) {
      const from = options.from;
      const limit = options.limit || 10;
      query = query.range(from, from + limit - 1);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Use type assertion to avoid complex type inference
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
