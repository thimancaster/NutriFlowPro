
import { supabase } from '@/integrations/supabase/client';
import { convertDbToPatient } from '../utils/patientDataUtils';
import { PatientFilters } from '@/types';

/**
 * Get patients with optional filtering and pagination
 */
export const getPatients = async (
  userId: string,
  filters: PatientFilters = { page: 1, pageSize: 10 }
) => {
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

    // Build the query with proper type handling
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });

    // Add filter conditions
    query = query.eq('user_id', userId);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('created_at', nextDay.toISOString());
    }

    // Add sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(offset, offset + pageSize - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) throw error;

    // Process results with safe type handling
    const patients = data
      ? data.map((record) => {
          // Create a deep copy to avoid reference issues
          const patientData = JSON.parse(JSON.stringify(record));
          return convertDbToPatient(patientData);
        })
      : [];

    return {
      success: true,
      data: patients,
      total: count || 0,
      count: count || 0,
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
