
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

// Define completely non-recursive primitive types
export type PatientsData = {
  patients: Array<Patient>;
  total: number;
};

// Define separate response types with primitive structures
export type GetPatientsSuccessResponse = {
  success: true;
  data: PatientsData;
};

export type GetPatientsErrorResponse = {
  success: false;
  error: string;
};

// Use union type with primitive components
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
    
    // Create and return success response
    const successResponse: GetPatientsSuccessResponse = {
      success: true,
      data: {
        patients: data as Patient[],
        total: count || 0
      }
    };
    return successResponse;
  } catch (error: any) {
    console.error('Error in getPatients:', error.message);
    // Create and return error response
    const errorResponse: GetPatientsErrorResponse = {
      success: false,
      error: error.message
    };
    return errorResponse;
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
    
    // Create and return success response with explicit type
    const successResponse: GetPatientsSuccessResponse = {
      success: true,
      data: {
        patients: data as Patient[],
        total: count || 0
      }
    };
    return successResponse;
  } catch (error: any) {
    console.error('Error in getSortedPatients:', error.message);
    // Create and return error response with explicit type
    const errorResponse: GetPatientsErrorResponse = {
      success: false,
      error: error.message
    };
    return errorResponse;
  }
};
