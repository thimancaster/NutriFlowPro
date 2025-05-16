
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';
import { logger } from '@/utils/logger';

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

/**
 * Create a simplified query with explicit typings to avoid deep type instantiation
 */
const buildPatientsQuery = (userId: string, status: string) => {
  // Instead of chaining methods, use variables and explicit types
  const query = supabase.from('patients');
  const select = query.select('*', { count: 'exact' });
  
  // Apply user filter
  if (status !== 'all') {
    return select.eq('user_id', userId).eq('status', status);
  } else {
    return select.eq('user_id', userId);
  }
};

/**
 * Process database results into a standardized response format
 * @param data - The raw data from the database
 * @param count - The count of total records
 * @param error - Any error that occurred during the query
 */
const processQueryResults = (
  data: any[] | null, 
  count: number | null, 
  error: any
): PatientsResponse => {
  if (error) {
    logger.error('Error in patient query:', error.message);
    return {
      success: false,
      error: error.message
    };
  }

  // Transform data with error handling
  const patients: Patient[] = [];
  if (Array.isArray(data)) {
    for (const record of data) {
      try {
        patients.push(convertDbToPatient(record));
      } catch (err) {
        logger.error('Error converting patient record:', err);
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
};

/**
 * Get patients with basic filtering
 */
export const getPatients = async (
  userId: string, 
  status: 'active' | 'archived' | 'all' = 'active',
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    // Get base query
    const query = buildPatientsQuery(userId, status);

    // Apply pagination separately
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Execute query with explicit range parameters
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    // Process results using the helper function
    return processQueryResults(data, count, error);
  } catch (error: any) {
    logger.error('Error in getPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get patients with advanced sorting and filtering
 */
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
    
    // Start with simple query to avoid chaining
    const baseQuery = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters step by step
    let query = baseQuery.eq('user_id', userId);
    
    // Apply status filter if not "all"
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter if provided
    if (search) {
      // Create search filter with explicit or conditions
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Execute with pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    // Process results using the helper function
    return processQueryResults(data, count, error);
  } catch (error: any) {
    logger.error('Error in getSortedPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
