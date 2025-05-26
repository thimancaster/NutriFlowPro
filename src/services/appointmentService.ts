
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

export const createAppointment = async (appointmentData: any) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in createAppointment:', error);
    return { success: false, message: error.message };
  }
};

export const updateAppointment = async (id: string, appointmentData: any) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return { success: false, message: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in updateAppointment:', error);
    return { success: false, message: error.message };
  }
};

export const deleteAppointment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteAppointment:', error);
    return { success: false, message: error.message };
  }
};

// Export as a service object
export const appointmentService = {
  getAppointments,
  getAppointmentsByPatient,
  getUpcomingAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
