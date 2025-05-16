
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
    // Direct variables to store results
    let data, count;
    
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Build query with minimal nesting
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not "all"
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Apply pagination and execute
    const result = await query.range(offset, offset + limit - 1);
    
    // Extract data directly to avoid deep nesting
    if (result.error) throw result.error;
    
    data = result.data || [];
    count = result.count || 0;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
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
        total: count
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
    
    // Build base query to avoid deep nesting
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters sequentially
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
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
    
    // Execute query
    const result = await query.range(offset, offset + limit - 1);
    
    if (result.error) throw result.error;
    
    const data = result.data || [];
    const count = result.count || 0;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
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
        total: count
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
