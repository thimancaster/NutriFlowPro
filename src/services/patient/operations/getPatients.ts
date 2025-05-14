
import { supabase } from '@/integrations/supabase/client';
import { Patient, PaginationParams, PatientFilters } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Format a patient record from database format to application format
 */
const formatPatientFromDb = (data: any): Patient => {
  return {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    secondaryPhone: data.secondary_phone || '',
    birthDate: data.birth_date ? new Date(data.birth_date) : undefined,
    sex: data.sex || '',
    address: data.address || {},
    objective: data.objective || '',
    notes: data.notes || '',
    profile: data.profile || '',
    cpf: data.cpf || '',
    archived_at: data.archived_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    user_id: data.user_id
  };
};

/**
 * Get patients from the database with pagination and filtering
 * @param pagination Pagination parameters (page, perPage)
 * @param filters Optional filter parameters
 * @returns Object containing the patients data, error info, and count
 */
export const getPatients = async (
  pagination: PaginationParams = { page: 0, perPage: 10 },
  filters: PatientFilters = {
    page: 1,
    pageSize: 10,
    status: 'active',
    sortBy: 'name',
    sortOrder: 'asc'
  }
): Promise<{ 
  data: Patient[], 
  error: Error | null,
  count: number 
}> => {
  const { page, perPage } = pagination;
  const start = page * perPage;
  const end = start + perPage - 1;

  try {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
      
    // Add sorting
    if (filters.sortBy && filters.sortOrder) {
      query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
    } else {
      query = query.order('name', { ascending: true });
    }

    // Add filters if they exist
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.status === 'active') {
      query = query.is('archived_at', null);
    } else if (filters.status === 'archived') {
      query = query.not('archived_at', 'is', null);
    }
    
    // Date range filters
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Add range for pagination
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching patients:', error);
      return {
        data: [],
        error: new Error(error.message),
        count: 0
      };
    }

    // Process the patients data
    const formattedPatients = data
      ? data.map(patient => formatPatientFromDb(patient))
      : [];

    return {
      data: formattedPatients,
      error: null,
      count: count || 0
    };

  } catch (error) {
    logger.error('Error in getPatients:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching patients";
    
    return {
      data: [],
      error: new Error(errorMessage),
      count: 0
    };
  }
};
