
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';

// Define simple response types without complex nesting
export type PatientsData = {
  patients: Array<Patient>;
  total: number;
};

export type GetPatientsSuccessResponse = {
  success: true;
  data: PatientsData;
};

export type GetPatientsErrorResponse = {
  success: false;
  error: string;
};

// Union type for response
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
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Build query step by step with explicit types
    // First create base query - no selection yet
    const baseQueryBuilder = supabase.from('patients');
    
    // Then add selection separately
    const withSelection = baseQueryBuilder.select('*', { count: 'exact' });
    
    // Add user filter as a separate step
    const withUser = withSelection.eq('user_id', userId);
    
    // Apply status filter conditionally
    let query = withUser;
    if (status !== 'all') {
      query = withUser.eq('status', status);
    }
    
    // Execute query with pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          console.error('Error converting patient record:', err);
        }
      }
    }
    
    return {
      success: true,
      data: {
        patients,
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
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 50;
    
    // Step 1: Create base query builder (no selection)
    const baseQueryBuilder = supabase.from('patients');
    
    // Step 2: Add selection with count
    const withSelection = baseQueryBuilder.select('*', { count: 'exact' });
    
    // Step 3: Add user filter
    const withUser = withSelection.eq('user_id', userId);
    
    // Step 4: Initialize the working query
    let workingQuery = withUser;
    
    // Step 5: Apply status filter if not "all"
    if (status !== 'all') {
      workingQuery = workingQuery.eq('status', status);
    }
    
    // Step 6: Apply search filter if present
    if (search) {
      workingQuery = workingQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Step 7: Apply date range filters if present
    if (startDate) {
      workingQuery = workingQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      workingQuery = workingQuery.lte('created_at', endDate);
    }
    
    // Step 8: Apply sorting
    const withSorting = workingQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Step 9: Execute query with pagination
    const { data, error, count } = await withSorting.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Step 10: Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          console.error('Error converting patient record:', err);
        }
      }
    }
    
    return {
      success: true,
      data: {
        patients,
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
