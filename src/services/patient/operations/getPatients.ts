
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';
import { logger } from '@/utils/logger';

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

export const getPatients = async (
  userId: string, 
  status: 'active' | 'archived' | 'all' = 'active',
  paginationParams?: {
    limit: number;
    offset: number;
  }
): Promise<PatientsResponse> => {
  try {
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 50;
    
    // Create base query
    const query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter
    query.eq('user_id', userId);
    
    // Apply status filter conditionally
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Apply pagination
    const from = offset;
    const to = offset + limit - 1;
    
    // Execute query with pagination range
    const result = await query.range(from, to);
    const { data, error, count } = result;
    
    if (error) throw error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          logger.error('Error converting patient record:', err);
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
    logger.error('Error in getPatients:', error.message);
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
    
    // Create base query
    const query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user filter
    query.eq('user_id', userId);
    
    // Apply status filter if not "all"
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Apply search filter if present
    if (search) {
      query.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    // Apply date range filters if present
    if (startDate) {
      query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query.lte('created_at', endDate);
    }
    
    // Apply sorting
    query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Execute query with pagination range
    const from = offset;
    const to = offset + limit - 1;
    const result = await query.range(from, to);
    const { data, error, count } = result;
    
    if (error) throw error;
    
    // Transform data with error handling
    const patients: Patient[] = [];
    if (Array.isArray(data)) {
      for (const record of data) {
        try {
          patients.push(convertDbToPatient(record));
        } catch (err) {
          logger.error('Error converting patient record:', err);
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
    logger.error('Error in getSortedPatients:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
