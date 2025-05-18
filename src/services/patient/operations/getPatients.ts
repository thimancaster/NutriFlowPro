
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
    // Create a basic query first - avoid building complex queries
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters one by one
    if (options?.status && options.status !== 'all') {
      query.eq('status', options.status);
    }

    // Apply search filter
    if (options?.search) {
      // Use a simple search approach
      query.ilike('name', `%${options.search}%`);
    }

    // Apply date filters
    if (options?.dateFrom) {
      query.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      query.lte('created_at', options.dateTo);
    }

    // Apply ordering
    if (options?.orderBy) {
      const direction = options?.orderDirection || 'asc';
      query.order(options.orderBy, { ascending: direction === 'asc' });
    } else {
      query.order('created_at', { ascending: false });
    }

    // Apply pagination
    if (options?.limit) {
      query.limit(options.limit);
    }

    if (options?.from !== undefined) {
      query.range(options.from, (options.from + (options.limit || 10)) - 1);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Return the result with minimal type manipulation
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
