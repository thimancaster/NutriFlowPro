
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
    // Variables to store our results
    let data, error, count;
    
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Build and execute query directly without chaining too many methods
    if (status === 'all') {
      const result = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .range(offset, offset + limit - 1);
      
      data = result.data;
      error = result.error;
      count = result.count;
    } else {
      const result = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', status)
        .range(offset, offset + limit - 1);
      
      data = result.data;
      error = result.error;
      count = result.count;
    }
    
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
    
    // Start with base query
    let baseQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not "all"
    if (status !== 'all') {
      baseQuery = baseQuery.eq('status', status);
    }
    
    // Apply search filter if provided
    if (search) {
      baseQuery = baseQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters if provided
    if (startDate) {
      baseQuery = baseQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      baseQuery = baseQuery.lte('created_at', endDate);
    }
    
    // Apply sorting
    const sortQuery = baseQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Finally apply pagination and execute
    const { data, error, count } = await sortQuery.range(offset, offset + limit - 1);
    
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
