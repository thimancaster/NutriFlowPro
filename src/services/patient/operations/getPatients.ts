
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
    // Avoid type instantiation issues by constructing query parameters first
    const query = {
      table: 'patients',
      select: '*',
      count: 'exact' as const,
      filters: {
        user_id: userId,
        status: status !== 'all' ? status : undefined
      },
      pagination: {
        from: paginationParams?.offset || 0,
        to: (paginationParams?.offset || 0) + (paginationParams?.limit || 9999) - 1
      }
    };
    
    // Build and execute query manually to avoid deep type instantiation
    let dbQuery = supabase.from(query.table).select(query.select, { count: query.count });
    dbQuery = dbQuery.eq('user_id', query.filters.user_id);
    
    if (query.filters.status) {
      dbQuery = dbQuery.eq('status', query.filters.status);
    }
    
    dbQuery = dbQuery.range(query.pagination.from, query.pagination.to);
    
    // Execute the constructed query
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
    // Avoid type instantiation issues by constructing query parameters first
    const query = {
      table: 'patients',
      select: '*',
      count: 'exact' as const,
      filters: {
        user_id: userId,
        status: status !== 'all' ? status : undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      },
      sort: {
        column: sortBy,
        ascending: sortOrder === 'asc'
      },
      pagination: {
        from: paginationParams?.offset ?? 0,
        to: (paginationParams?.offset ?? 0) + (paginationParams?.limit ?? 9999) - 1
      }
    };
    
    // Build and execute query step by step to avoid deep type instantiation
    let dbQuery = supabase.from(query.table).select(query.select, { count: query.count });
    
    // Apply filters
    dbQuery = dbQuery.eq('user_id', query.filters.user_id);
    
    if (query.filters.status) {
      dbQuery = dbQuery.eq('status', query.filters.status);
    }
    
    if (query.filters.search) {
      dbQuery = dbQuery.or(`name.ilike.%${query.filters.search}%,email.ilike.%${query.filters.search}%,cpf.ilike.%${query.filters.search}%`);
    }
    
    if (query.filters.startDate) {
      dbQuery = dbQuery.gte('created_at', query.filters.startDate);
    }
    
    if (query.filters.endDate) {
      dbQuery = dbQuery.lte('created_at', query.filters.endDate);
    }
    
    // Apply sorting
    dbQuery = dbQuery.order(query.sort.column, { ascending: query.sort.ascending });
    
    // Apply pagination
    dbQuery = dbQuery.range(query.pagination.from, query.pagination.to);
    
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
