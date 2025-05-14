
import { supabase } from '@/integrations/supabase/client';
import { PatientFilters, Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';

/**
 * Get patients for a specific user with filtering options
 */
export const getPatients = async (userId: string, filters?: PatientFilters) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Start building the query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Apply filters
    if (filters) {
      // Filter by status
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Filter by search term
      if (filters.search) {
        // We use ilike for case-insensitive search
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Filter by date range
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('created_at', filters.startDate)
          .lte('created_at', filters.endDate);
      }

      // Order by
      if (filters.sortBy) {
        const order = filters.sortOrder || 'asc';
        query = query.order(filters.sortBy, { ascending: order === 'asc' });
      } else {
        // Default ordering by name
        query = query.order('name', { ascending: true });
      }
      
      // Apply pagination using range
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }
    }

    // Fetch data with count
    const { data: patientsData, error, count } = await query;

    if (error) throw error;

    if (!patientsData) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Convert DB format to application format
    const patients = patientsData.map(patient => {
      const safePatient = JSON.parse(JSON.stringify(patient));
      return convertDbToPatient(safePatient);
    });

    return {
      success: true,
      data: patients,
      count: count || 0
    };
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch patients',
      data: []
    };
  }
};
