
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
    // Initialize the query without chaining to avoid deep type instantiation
    const query = supabase.from('patients');
    
    // Build the query parts separately
    const selectQuery = query.select('*', { count: 'exact' });
    
    // Apply filters
    const filteredQuery = selectQuery.eq('user_id', userId);
    
    // Create a new query with status filter if needed
    let finalQuery = filteredQuery;
    if (status !== 'all') {
      finalQuery = filteredQuery.eq('status', status);
    }
    
    // Set up pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Execute query with range
    const { data, error, count } = await finalQuery.range(offset, offset + limit - 1);
    
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
    // Initialize the query without chaining to avoid deep type instantiation
    const query = supabase.from('patients');
    
    // Start building the query
    let builtQuery = query.select('*', { count: 'exact' })
                          .eq('user_id', userId);
    
    // Apply status filter
    if (status !== 'all') {
      builtQuery = builtQuery.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      builtQuery = builtQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters
    if (startDate) {
      builtQuery = builtQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      builtQuery = builtQuery.lte('created_at', endDate);
    }
    
    // Apply sorting
    builtQuery = builtQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 50;
    
    // Execute query with range
    const { data, error, count } = await builtQuery.range(offset, offset + limit - 1);
    
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
