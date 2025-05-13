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

/**
 * Get patients with optional filtering and pagination
 */
export const getPatients = async (
  userId: string,
  filters: PatientFilters = { page: 1, pageSize: 10 }
): Promise<{
  success: boolean;
  data: ReturnType<typeof convertDbToPatient>[];
  total: number;
  count: number;
  error?: string;
}> => {
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

    // Use a simpler approach with less type complexity
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Apply user ID filter
    query = query.eq('user_id', userId);
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply date filters if provided
    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('created_at', nextDay.toISOString());
    }

    // Add sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Add pagination
    query = query.range(offset, offset + pageSize - 1);

    // Execute query without complex type assertions
    const { data, error, count } = await query;

    if (error) throw error;

    // Process the patient data
    const patients = [];
    if (data) {
      for (const record of data) {
        // Create a safe copy to avoid reference issues
        const patientCopy = JSON.parse(JSON.stringify(record));
        patients.push(convertDbToPatient(patientCopy));
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
