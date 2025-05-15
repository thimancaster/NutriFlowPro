
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';

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

// Define a simplified type for database records with primitive types only
type PatientRecordRaw = Record<string, any>;

export const getPatients = async (
  userId: string, 
  status: 'active' | 'archived' | 'all' = 'active',
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    // Create a base query with proper type safety
    let baseQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      baseQuery = baseQuery.eq('status', status);
    }
    
    // Apply pagination with safe defaults
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    baseQuery = baseQuery.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await baseQuery;
    
    if (error) throw error;
    
    // Process data safely to avoid excessive type instantiation
    const patients: Patient[] = [];
    if (data && Array.isArray(data)) {
      // Use simple iteration over the array
      for (let i = 0; i < data.length; i++) {
        patients.push(convertDbToPatient(data[i] as PatientRecordRaw));
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
    // Start building the query - with proper type safety
    let baseQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      baseQuery = baseQuery.eq('status', status);
    }
    
    // Apply search filter if provided
    if (search) {
      baseQuery = baseQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date range filter if provided
    if (startDate) {
      baseQuery = baseQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      baseQuery = baseQuery.lte('created_at', endDate);
    }
    
    // Apply sorting
    baseQuery = baseQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination with safe handling of undefined values
    if (paginationParams) {
      baseQuery = baseQuery.range(
        paginationParams.offset,
        paginationParams.offset + paginationParams.limit - 1
      );
    } else {
      baseQuery = baseQuery.range(0, 9999); // Default range if no pagination
    }
    
    // Execute query
    const { data, error, count } = await baseQuery;
    
    if (error) throw error;
    
    // Process data safely to avoid excessive type instantiation
    const patients: Patient[] = [];
    if (data && Array.isArray(data)) {
      // Use simple iteration over the array
      for (let i = 0; i < data.length; i++) {
        patients.push(convertDbToPatient(data[i] as PatientRecordRaw));
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
