
import { supabase } from '@/integrations/supabase/client';
import { PatientFilters, PaginationParams, Patient } from '@/types';
import { formatPatientData } from '../utils/patientDataUtils';

export async function getPatients(filters: PatientFilters = {}, pagination?: PaginationParams) {
  try {
    // Start building the query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Apply date range filter if provided
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply sorting
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? false : true;
      query = query.order(filters.sortBy, { ascending: order });
    } else {
      // Default sorting by created_at descending
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination if provided
    if (pagination) {
      query = query.range(
        (pagination.page ?? 0) * (pagination.perPage ?? 10),
        (pagination.page ?? 0) * (pagination.perPage ?? 10) + (pagination.perPage ?? 10) - 1
      );
    }

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    // Format the data and return
    const formattedData = data?.map(patient => formatPatientData(patient)) || [];

    return {
      success: true,
      data: formattedData,
      count
    };

  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0
    };
  }
}
