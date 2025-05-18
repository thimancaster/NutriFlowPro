
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
    // Build a simple query without complex chaining
    const query = supabase.from('patients');
    
    // First select with count
    const selectQuery = query.select('*', { count: 'exact' });
    
    // Add filters directly without reassignment
    // User ID filter
    selectQuery.eq('user_id', userId);
    
    // Status filter if provided
    if (options?.status && options.status !== 'all') {
      selectQuery.eq('status', options.status);
    }

    // Simple search on name
    if (options?.search) {
      selectQuery.ilike('name', `%${options.search}%`);
    }

    // Date range filters
    if (options?.dateFrom) {
      selectQuery.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      selectQuery.lte('created_at', options.dateTo);
    }

    // Apply ordering
    if (options?.orderBy) {
      selectQuery.order(options.orderBy, { 
        ascending: options.orderDirection === 'asc' 
      });
    } else {
      selectQuery.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options?.limit) {
      selectQuery.limit(options.limit);
    }

    if (options?.from !== undefined) {
      const from = options.from;
      const limit = options.limit || 10;
      selectQuery.range(from, from + limit - 1);
    }

    // Execute the query
    const { data, error, count } = await selectQuery;

    if (error) {
      throw error;
    }

    // Return the result with simple types
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
