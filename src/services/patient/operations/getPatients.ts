
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

// Simple type for database records
type RawPatientRecord = Record<string, any>;

export const getPatients = async (
  userId: string, 
  status: 'active' | 'archived' | 'all' = 'active',
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    // Create query components separately without chaining
    let queryData;
    let queryError;
    let queryCount = 0;
    
    // Create the base query first
    const baseQueryResult = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .then(result => {
        // Filter by status if needed
        if (status !== 'all') {
          return supabase
            .from('patients')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('status', status);
        }
        return result;
      });
    
    // Apply pagination separately
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Execute final query with range
    const { data, error, count } = await supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);
    
    queryData = data;
    queryError = error;
    queryCount = count || 0;
    
    if (queryError) throw queryError;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (queryData && Array.isArray(queryData)) {
      for (const record of queryData as RawPatientRecord[]) {
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
        total: queryCount
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
    // Apply filters progressively by executing separate queries
    let queryData;
    let queryError;
    let queryCount = 0;
    
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 50;
    
    // Construct the base query
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter (required)
    query = query.eq('user_id', userId);
    
    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter if specified
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters if specified
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Execute the final query with pagination
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (data && Array.isArray(data)) {
      for (const record of data as RawPatientRecord[]) {
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
