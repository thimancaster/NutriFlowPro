
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
    // Start with a simple base query
    let { data, error, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .match(options?.status && options.status !== 'all' 
        ? { status: options.status } 
        : {})
      .order(
        options?.orderBy || 'created_at', 
        { ascending: options?.orderDirection === 'asc' || false }
      )
      .limit(options?.limit || 50)
      .range(
        options?.from || 0,
        options?.from !== undefined ? options.from + (options.limit || 10) - 1 : 49
      );
    
    // Apply text search if provided - do it separately to avoid deep type issues
    if (options?.search && data) {
      data = data.filter(patient => 
        patient.name?.toLowerCase().includes(options.search?.toLowerCase() || '')
      );
    }

    // Apply date filters if needed - do client-side to avoid deep chaining
    if ((options?.dateFrom || options?.dateTo) && data) {
      data = data.filter(patient => {
        const createdAt = patient.created_at ? new Date(patient.created_at) : null;
        if (!createdAt) return true;
        
        let match = true;
        if (options?.dateFrom && createdAt < new Date(options.dateFrom)) {
          match = false;
        }
        if (options?.dateTo && createdAt > new Date(options.dateTo)) {
          match = false;
        }
        return match;
      });
    }

    if (error) {
      throw error;
    }

    // Return with simple types to avoid complex type inference
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
