
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
 * Helper function to execute a patient query and format the response
 * @param queryFn Function that builds and executes the Supabase query
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
  // Apply pagination
  const offset = paginationParams?.offset || 0;
  const limit = paginationParams?.limit || 50;
  const from = offset;
  const to = offset + limit - 1;
  
  return executePatientQuery(async () => {
    // Create a type-safe query builder function instead of chaining methods
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters separately
    query = query.eq('user_id', userId);
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Execute with pagination
    return await query.range(from, to);
  });
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
  // Apply pagination
  const offset = paginationParams?.offset ?? 0;
  const limit = paginationParams?.limit ?? 50;
  const from = offset;
  const to = offset + limit - 1;
  
  return executePatientQuery(async () => {
    // Create simple query without chaining to avoid deep type instantiation
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters separately
    query = query.eq('user_id', userId);
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      // Use explicit variable for search filter to avoid nesting
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
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
    return await query.range(from, to);
  });
};
