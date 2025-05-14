
import { supabase } from '@/integrations/supabase/client';
import { PatientFilters, Patient } from '@/types';
import { convertDbToPatient } from '../utils/patientDataUtils';

interface PatientDB {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  secondaryPhone?: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  notes: string | null;
  goals: any;
  measurements: any;
  created_at: string;
  updated_at: string;
  status: string;
  cpf?: string | null;
}

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
      .select('*')
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
    }

    // Fetch data
    const { data: patientsData, error, count } = await query;

    if (error) throw error;

    if (!patientsData) {
      return {
        success: true,
        data: [],
        count: 0
      };
    }

    // Apply pagination in memory if necessary
    let paginatedData = [...patientsData];
    let total = patientsData.length;

    if (filters?.page && filters?.pageSize) {
      const start = (filters.page - 1) * filters.pageSize;
      const end = start + filters.pageSize;
      paginatedData = patientsData.slice(start, end);
      total = patientsData.length;
    }

    // Convert DB format to application format
    const patients = paginatedData.map(patient => {
      // Use a safe parsing approach to avoid deep type issues
      const safePatient = JSON.parse(JSON.stringify(patient));
      return convertDbToPatient(safePatient);
    });

    return {
      success: true,
      data: patients,
      count: total
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
