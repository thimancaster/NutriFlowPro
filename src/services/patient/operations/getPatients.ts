
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
    // Start with the base query
    const baseQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not 'all'
    const statusQuery = status !== 'all' 
      ? baseQuery.eq('status', status)
      : baseQuery;
    
    // Calculate pagination values
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    
    // Execute the query with pagination
    const { data, error, count } = await statusQuery
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Process data with minimal type operations
    const patients: Patient[] = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const patientRecord = data[i] as PatientRecordRaw;
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
    // Start with base query
    const baseQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Build query step by step without chaining too many operations
    let finalQuery = baseQuery;
    
    // Apply status filter
    if (status !== 'all') {
      finalQuery = finalQuery.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      finalQuery = finalQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters
    if (startDate) {
      finalQuery = finalQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      finalQuery = finalQuery.lte('created_at', endDate);
    }
    
    // Calculate pagination values
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 9999;
    
    // Execute query with sorting and pagination
    const { data, error, count } = await finalQuery
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Process data with minimal type operations
    const patients: Patient[] = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const patientRecord = data[i] as PatientRecordRaw;
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
