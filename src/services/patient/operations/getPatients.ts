
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
 * Simple query builder helper to avoid excessive type instantiation
 */
const buildPatientsQuery = (userId: string, status: string) => {
  // Create base query
  const query = supabase.from('patients').select('*', { count: 'exact' });
  
  // Apply filters
  const filterQuery = query.eq('user_id', userId);
  
  // Only apply status filter if not 'all'
  if (status !== 'all') {
    return filterQuery.eq('status', status);
  }
  
  return filterQuery;
};

/**
 * Helper function to execute a patient query and format the response
 */
const executePatientQuery = async (
  queryFn: () => Promise<{ data: any[] | null; error: any; count: number | null }>
): Promise<PatientsResponse> => {
  try {
    const { data, error, count } = await queryFn();
    
    if (error) throw error;
    
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
  } catch (error: any) {
    logger.error('Error in patient query:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
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
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Build the query step by step to avoid deep type instantiation
    const baseQuery = buildPatientsQuery(userId, status);
    
    // Execute with pagination
    const { data, error, count } = await baseQuery.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
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
    
    // Start with base query
    let query = buildPatientsQuery(userId, status);
    
    // Apply additional filters
    if (search) {
      // Create search filter as a separate variable
      const searchFilter = `name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`;
      query = query.or(searchFilter);
    }
    
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
    
    if (error) throw error;
    
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
  } catch (error: any) {
    logger.error('Error in getSortedPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
