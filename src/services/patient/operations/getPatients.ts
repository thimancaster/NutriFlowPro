
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
    // Build the query step by step without complex chaining
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not "all"
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Set up pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    
    // Execute query with range
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
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
    // Build the query step by step without complex chaining
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Date filters
    if (startDate) {
      query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 9999;
    
    // Execute query with range
    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
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
