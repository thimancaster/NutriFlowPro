
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

// Define a simple type for raw database records to avoid deep type instantiation
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
    // Start with a simple query structure
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    // Add user filter
    query.eq('user_id', userId);
    
    // Add status filter if not 'all'
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Calculate pagination values
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    
    // Add pagination
    query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Process data with minimal type operations
    const patients: Patient[] = [];
    if (data) {
      for (const record of data) {
        const patientRecord = record as PatientRecordRaw;
        patients.push(convertDbToPatient(patientRecord));
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
    // Start with simple query structure
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    // Add user filter
    query.eq('user_id', userId);
    
    // Add status filter
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Add search filter
    if (search) {
      query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Add date filters
    if (startDate) {
      query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query.lte('created_at', endDate);
    }
    
    // Add sorting
    query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Calculate pagination values
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 9999;
    
    // Add pagination
    query.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Process data with minimal type operations
    const patients: Patient[] = [];
    if (data) {
      for (const record of data) {
        const patientRecord = record as PatientRecordRaw;
        patients.push(convertDbToPatient(patientRecord));
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
