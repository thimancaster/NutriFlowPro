
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

// Define primitive types with no circular references
export type PatientsData = {
  patients: Array<Patient>;
  total: number;
};

// Define success response type
export type GetPatientsSuccessResponse = {
  success: true;
  data: PatientsData;
};

// Define error response type
export type GetPatientsErrorResponse = {
  success: false;
  error: string;
};

// Use union type for the response
export type PatientsResponse = GetPatientsSuccessResponse | GetPatientsErrorResponse;

export const getPatients = async (
  userId: string, 
  status: 'active' | 'archived' | 'all' = 'active',
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply pagination if provided
    if (paginationParams) {
      const { limit, offset } = paginationParams;
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      data: {
        patients: data as Patient[],
        total: count || 0
      }
    };
  } catch (error: any) {
    console.error('Error in getPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function for getting sorted patients
export const getSortedPatients = async (
  userId: string,
  status: 'active' | 'archived' | 'all' = 'active',
  sortBy: string = 'name',
  sortOrder: 'asc' | 'desc' = 'asc',
  search: string = '',
  startDate?: string,
  endDate?: string,
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter if provided
    if (search) {
      // Using separate ilike conditions to avoid complex query strings
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date range filter if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination if provided
    if (paginationParams) {
      const { limit, offset } = paginationParams;
      query = query.range(offset, offset + limit - 1);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      success: true,
      data: {
        patients: data as Patient[],
        total: count || 0
      }
    };
  } catch (error: any) {
    console.error('Error in getSortedPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
