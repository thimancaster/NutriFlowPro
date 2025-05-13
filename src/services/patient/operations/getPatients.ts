import { supabase } from '@/integrations/supabase/client';
import { convertDbToPatient } from '../utils/patientDataUtils';
import { PatientFilters } from '@/types';

// Typing for patient data from the database
interface PatientDB {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  user_id: string;
  // Other fields from the patients table
  birth_date?: string;
  gender?: string;
  phone?: string;
  address?: string;
  goals?: any;
  notes?: string;
}

// Typing for Supabase query result
interface SupabaseQueryResult<T> {
  data: T | null;
  error: Error | null;
  count: number | null;
}

// Typing for function return
interface GetPatientsResult {
  success: boolean;
  data: ReturnType<typeof convertDbToPatient>[];
  total: number;
  count: number;
  error?: string;
}

/**
 * Get patients with optional filtering and pagination
 */
export const getPatients = async (
  userId: string,
  filters: PatientFilters = { page: 1, pageSize: 10 }
): Promise<GetPatientsResult> => {
  try {
    const {
      search = '',
      status = 'active',
      startDate,
      endDate,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      pageSize = 10,
    } = filters;

    const offset = (page - 1) * pageSize;

    // Start building query
    let queryBuilder = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (search) {
      queryBuilder = queryBuilder.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (startDate) {
      queryBuilder = queryBuilder.gte('created_at', startDate);
    }

    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder = queryBuilder.lt('created_at', nextDay.toISOString());
    }

    // Add sorting and pagination
    queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });
    queryBuilder = queryBuilder.range(offset, offset + pageSize - 1);

    // Execute query with explicit typing
    const result = await queryBuilder as unknown as SupabaseQueryResult<PatientDB[]>;
    const { data, error, count } = result;

    if (error) throw error;

    // Convert records safely using traditional loop
    const patients = [];
    if (data) {
      for (const record of data) {
        // Create safe copy to avoid reference issues
        const safeCopy = JSON.parse(JSON.stringify(record));
        patients.push(convertDbToPatient(safeCopy));
      }
    }

    return {
      success: true,
      data: patients,
      total: count ?? 0,
      count: count ?? 0
    };
  } catch (error: any) {
    console.error('Error getting patients:', error);
    return {
      success: false,
      error: error.message || 'Failed to get patients',
      data: [],
      total: 0,
      count: 0,
    };
  }
};
