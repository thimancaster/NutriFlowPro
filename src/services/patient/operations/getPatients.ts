
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
    
    // Create the base query manually to avoid complex type inference
    const baseQuery = supabase.from('patients');
    
    // Add selection with count
    const queryWithSelect = baseQuery.select('*', { count: 'exact' });
    
    // Add user filter
    const queryWithUser = queryWithSelect.eq('user_id', userId);
    
    // Add status filter if needed
    let finalQuery = queryWithUser;
    if (status !== 'all') {
      finalQuery = queryWithUser.eq('status', status);
    }
    
    // Apply pagination and execute query
    const result = await finalQuery.range(offset, offset + limit - 1);
    
    if (result.error) throw result.error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(result.data)) {
      for (const record of result.data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          console.error('Error converting patient record:', err);
          // Continue with other records even if one fails
        }
      }
    }
    
    return {
      success: true,
      data: {
        patients,
        total: result.count || 0
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
    
    // Create base query step by step to avoid complex type inference
    const baseQuery = supabase.from('patients');
    const selectQuery = baseQuery.select('*', { count: 'exact' });
    const userQuery = selectQuery.eq('user_id', userId);
    
    // Apply filters one by one
    let currentQuery = userQuery;
    
    // Status filter
    if (status !== 'all') {
      currentQuery = currentQuery.eq('status', status);
    }
    
    // Search filter
    if (search) {
      currentQuery = currentQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Date filters
    if (startDate) {
      currentQuery = currentQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      currentQuery = currentQuery.lte('created_at', endDate);
    }
    
    // Sorting
    const sortedQuery = currentQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Pagination and execution
    const result = await sortedQuery.range(offset, offset + limit - 1);
    
    if (result.error) throw result.error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(result.data)) {
      for (const record of result.data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          console.error('Error converting patient record:', err);
          // Continue with other records even if one fails
        }
      }
    }
    
    return {
      success: true,
      data: {
        patients,
        total: result.count || 0
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
