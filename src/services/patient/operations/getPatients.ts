
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types/patient';
import { dbCache } from '@/services/dbCache';

interface GetPatientsOptions {
  userId?: string;
  status?: 'active' | 'archived' | 'all';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Fetch patients with filtering, pagination and sorting
 */
export const getPatients = async ({
  userId,
  status = 'active',
  search = '',
  page = 1,
  limit = 10,
  sortBy = 'created_at',
  sortDirection = 'desc'
}: GetPatientsOptions = {}): Promise<{ data: Patient[], count: number }> => {
  try {
    // Create cache key based on query parameters
    const cacheKey = `${dbCache.KEYS.PATIENTS}_${userId || 'all'}_${status}_${search}_${page}_${limit}_${sortBy}_${sortDirection}`;
    
    // Check cache first
    const cachedResult = dbCache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // Start building query
    let query = supabase.from('patients').select('*', { count: 'exact' });
    
    // Filter by user if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Filter by status unless 'all' is specified
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Filter by search term if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    // Sort the results
    query = query.order(sortBy, { ascending: sortDirection === 'asc' });
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Process results
    const patients = data?.map(patient => ({
      ...patient,
      status: (patient.status as 'active' | 'archived') || 'active',
      address: typeof patient.address === 'string' ? JSON.parse(patient.address) : patient.address || {},
      goals: typeof patient.goals === 'string' ? JSON.parse(patient.goals) : patient.goals || {},
      measurements: typeof patient.measurements === 'string' ? JSON.parse(patient.measurements) : patient.measurements || {}
    })) || [];
    
    const result = { 
      data: patients, 
      count: count || 0 
    };
    
    // Cache the result
    dbCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}
