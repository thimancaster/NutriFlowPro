
import { supabase } from '@/integrations/supabase/client';
import { convertDbToPatient } from '../utils/patientDataUtils';
import { PatientFilters } from '@/types';

/**
 * Get patients with optional filtering and pagination
 */
export const getPatients = async (userId: string, filters: PatientFilters = {
  page: 1,
  pageSize: 10
}) => {
  try {
    const {
      search = '',
      status = 'active',
      startDate,
      endDate,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      pageSize = 10
    } = filters;
    
    // Calculate offset based on page and pageSize
    const offset = (page - 1) * pageSize;
    
    // Start building query with clean object
    const query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply status filter if not 'all'
    if (status !== 'all') {
      query.eq('status', status);
    }
    
    // Apply search filter
    if (search) {
      query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply date range filters
    if (startDate) {
      query.gte('created_at', startDate);
    }
    
    if (endDate) {
      // Add a day to endDate to include the entire day
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query.lt('created_at', nextDay.toISOString());
    }
    
    // Apply sorting
    query.order(sortBy, { ascending: sortOrder === 'asc' });
    
    // Apply pagination
    query.range(offset, offset + pageSize - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Convert DB records to Patient objects with safe deep copying
    const patients = data ? data.map(record => {
      // Use structuredClone for modern environments, or JSON parse/stringify for deep copying
      const safeRecord = JSON.parse(JSON.stringify(record));
      return convertDbToPatient(safeRecord);
    }) : [];
    
    return {
      success: true,
      data: patients,
      total: count || 0,
      count: count || 0
    };
  } catch (error: any) {
    console.error('Error getting patients:', error);
    return {
      success: false,
      error: error.message || 'Failed to get patients',
      data: [],
      total: 0,
      count: 0
    };
  }
};
