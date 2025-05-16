
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
    // Start with base query
    const baseQuery = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters directly on the query object
    const userFilteredQuery = baseQuery.eq('user_id', userId);
    
    // Apply status filter if needed
    let filteredQuery = userFilteredQuery;
    if (status !== 'all') {
      filteredQuery = userFilteredQuery.eq('status', status);
    }
    
    // Set up pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    
    // Execute query with range
    const { data, error, count } = await filteredQuery.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Transform data
    const patients: Patient[] = [];
    if (data) {
      for (const record of data as RawPatientRecord[]) {
        patients.push(convertDbToPatient(record));
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
    // Start with base query
    const baseQuery = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter first
    const userFilteredQuery = baseQuery.eq('user_id', userId);
    
    // Apply all other filters step by step
    let filteredQuery = userFilteredQuery;
    
    // Status filter
    if (status !== 'all') {
      filteredQuery = filteredQuery.eq('status', status);
    }
    
    // Search filter
    if (search) {
      filteredQuery = filteredQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Date filters
    if (startDate) {
      filteredQuery = filteredQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      filteredQuery = filteredQuery.lte('created_at', endDate);
    }
    
    // Sorting
    const sortedQuery = filteredQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 9999;
    
    // Execute query with range
    const { data, error, count } = await sortedQuery.range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Transform data
    const patients: Patient[] = [];
    if (data) {
      for (const record of data as RawPatientRecord[]) {
        patients.push(convertDbToPatient(record));
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
