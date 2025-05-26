
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export interface PatientsFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface PatientsResponse {
  success: boolean;
  data?: Patient[];
  total?: number;
  error?: string;
}

export const getPatients = async (
  userId: string,
  filters: PatientsFilters = {},
  page: number = 1,
  pageSize: number = 10
): Promise<PatientsResponse> => {
  try {
    console.log('Fetching patients with filters:', filters, 'page:', page);

    // Otimização: Selecionar apenas as colunas necessárias para melhor performance
    let query = supabase
      .from('patients')
      .select(`
        id,
        name,
        email,
        phone,
        birth_date,
        status,
        created_at,
        updated_at,
        user_id
      `, { count: 'exact' })
      .eq('user_id', userId); // Usar o índice idx_patients_user_id

    // Aplicar filtros de status (usar índice composto idx_patients_user_id_status)
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Aplicar filtro de busca
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Aplicar ordenação
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Aplicar paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
      return { success: false, error: error.message };
    }

    // Processar dados dos pacientes
    const patients: Patient[] = (data || []).map(patient => ({
      ...patient,
      status: (patient.status as 'active' | 'archived') || 'active',
      goals: {},
      measurements: {},
      address: undefined
    }));

    return { 
      success: true, 
      data: patients, 
      total: count || 0 
    };
  } catch (error: any) {
    console.error('Error in getPatients:', error);
    return { success: false, error: error.message };
  }
};
