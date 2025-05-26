
import { supabase } from "@/integrations/supabase/client";

export interface AppointmentFilters {
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const getAppointments = async (
  userId: string,
  filters: AppointmentFilters = {}
) => {
  try {
    console.log('Fetching appointments with filters:', filters);

    // Otimização: Selecionar apenas as colunas necessárias
    let query = supabase
      .from('appointments')
      .select(`
        id,
        user_id,
        patient_id,
        date,
        type,
        status,
        notes,
        recommendations,
        created_at,
        updated_at
      `)
      .eq('user_id', userId) // Usar o índice idx_appointments_user_id
      .order('date', { ascending: false }); // Usar o índice idx_appointments_user_id_date

    // Aplicar filtros
    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Aplicar filtros de data (usar índice composto)
    if (filters.startDate) {
      query = query.gte('date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('date', filters.endDate);
    }

    // Aplicar limite
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error in getAppointments:', error);
    return { success: false, error: error.message };
  }
};

export const getAppointmentsByPatient = async (
  userId: string,
  patientId: string,
  limit: number = 10
) => {
  return getAppointments(userId, { patientId, limit });
};

export const getUpcomingAppointments = async (
  userId: string,
  limit: number = 5
) => {
  const today = new Date().toISOString().split('T')[0];
  return getAppointments(userId, { 
    startDate: today, 
    status: 'scheduled', 
    limit 
  });
};
