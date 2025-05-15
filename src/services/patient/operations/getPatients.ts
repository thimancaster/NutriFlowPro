
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
    // Start with the base query using the literal table name
    let dbQuery = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters
    dbQuery = dbQuery.eq('user_id', userId);
    
    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }
    
    // Apply pagination
    const offset = paginationParams?.offset || 0;
    const limit = paginationParams?.limit || 9999;
    dbQuery = dbQuery.range(offset, offset + limit - 1);
    
    // Execute the query
    const { data, error, count } = await dbQuery;
    
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
    // Start with base query using literal table name
    let dbQuery = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply filters
    dbQuery = dbQuery.eq('user_id', userId);
    
    if (status !== 'all') {
      dbQuery = dbQuery.eq('status', status);
    }
    
    if (search) {
      dbQuery = dbQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,cpf.ilike.%${search}%`);
    }
    
    if (startDate) {
      dbQuery = dbQuery.gte('created_at', startDate);
    }
    
    if (endDate) {
      dbQuery = dbQuery.lte('created_at', endDate);
    }
    
    // Apply sorting
    dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    const offset = paginationParams?.offset ?? 0;
    const limit = paginationParams?.limit ?? 9999;
    dbQuery = dbQuery.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await dbQuery;
    
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
