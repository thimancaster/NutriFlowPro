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

    // Início da query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    // Aplicar status se não for 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Aplicar busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Filtro por data de início
    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    // Filtro por data de fim (incluindo o dia inteiro)
    if (endDate) {
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('created_at', nextDay.toISOString());
    }

    // Ordenação
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Paginação
    query = query.range(offset, offset + pageSize - 1);

    // Executar query
    const { data, error, count } = await query;

    if (error) throw error;

    const patients = data
      ? data.map((record) => {
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
