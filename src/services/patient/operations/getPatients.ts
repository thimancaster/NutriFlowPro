
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { dbCache } from '@/services/dbCache';

export interface PatientFilter {
  searchTerm?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  perPage?: number;
}

export const getPatients = async (
  userId: string,
  filter: PatientFilter = {}
): Promise<{data: Patient[] | null, error: Error | null, count: number}> => {
  try {
    const { searchTerm, status = 'all', sortBy = 'updated_at', sortOrder = 'desc', page = 1, perPage = 10 } = filter;
    
    // Calculate pagination values
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    // Start building the query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });
    
    // Add user filter
    query = query.eq('user_id', userId);
    
    // Add search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.ilike('name', `%${searchTerm}%`);
    }
    
    // Add status filter if not 'all'
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Add sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      throw error;
    }
    
    // Process the data to normalize structures
    const processedData = data?.map(patient => {
      let goals = patient.goals;
      let address = patient.address;
      
      // Handle goals field
      if (typeof goals === 'string') {
        try {
          goals = JSON.parse(goals);
        } catch (e) {
          goals = {};
        }
      }
      
      // Handle address field
      if (typeof address === 'string') {
        try {
          address = JSON.parse(address);
        } catch (e) {
          address = {};
        }
      }
      
      return {
        ...patient,
        goals: goals || {},
        address: address || {}
      };
    }) as Patient[];
    
    return {
      data: processedData,
      error: null,
      count: count || 0
    };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return {
      data: null,
      error: error as Error,
      count: 0
    };
  }
};
