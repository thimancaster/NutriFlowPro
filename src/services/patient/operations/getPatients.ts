
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
  // Use a simpler indexer signature
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
    // Create a simple initial query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply status filter if provided
    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status);
    }

    // Apply search filter if provided
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      query = query.or(`name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`);
    }

    // Apply date filters
    if (options?.dateFrom) {
      query = query.gte('created_at', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('created_at', options.dateTo);
    }

    // Apply ordering if provided
    if (options?.orderBy) {
      const direction = options?.orderDirection || 'asc';
      query = query.order(options.orderBy, { ascending: direction === 'asc' });
    } else {
      // Default ordering by created_at
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination if provided
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.from !== undefined) {
      query = query.range(options.from, (options.from + (options.limit || 10)) - 1);
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Use type assertion without complex object construction
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
