
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
    // Use any for intermediate query to avoid deep type instantiation
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter
    query = query.eq('user_id', userId);
    
    // Apply status filter if needed
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Set up pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50; // Reduced from 9999 to a more reasonable number
    
    // Execute query with range
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
    // Use any for intermediate query to avoid deep type instantiation
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter
    query = query.eq('user_id', userId);
    
    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 50; // Reduced from 9999 to a more reasonable number
    
    // Execute query with range
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
