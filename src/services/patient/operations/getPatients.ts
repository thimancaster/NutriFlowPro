
import { supabase } from '@/integrations/supabase/client';
import { dbCache } from '@/services/dbCache';
import { Patient, PaginationParams, PatientFilters } from '@/types';
import { formatPatientFromDb } from '../utils/patientDataUtils';

/**
 * Get patients from the database with pagination and filtering
 * @param pagination Pagination parameters (page, perPage)
 * @param filters Optional filter parameters
 * @returns Object containing the patients data, error info, and count
 */
export const getPatients = async (
  pagination: PaginationParams = { page: 0, perPage: 10 },
  filters: PatientFilters = {}
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
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    // Add filters if they exist
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.status === 'active') {
      query = query.is('archived_at', null);
    } else if (filters.status === 'archived') {
      query = query.not('archived_at', 'is', null);
    }

    // Add range for pagination
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
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
    console.error('Error in getPatients:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching patients";
    
    return {
      data: [],
      error: new Error(errorMessage),
      count: 0
    };
  }
};
