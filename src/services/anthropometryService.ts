
import { supabase } from "@/integrations/supabase/client";

export interface AnthropometryFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const getAnthropometryData = async (
  userId: string,
  filters: AnthropometryFilters = {}
) => {
  try {
    console.log('Fetching anthropometry data with filters:', filters);

    // Otimização: Selecionar apenas as colunas necessárias
    let query = supabase
      .from('anthropometry')
      .select(`
        id,
        patient_id,
        user_id,
        date,
        weight,
        height,
        imc,
        body_fat_pct,
        lean_mass_kg,
        created_at
      `)
      .eq('user_id', userId) // Usar o índice idx_anthropometry_user_id
      .order('date', { ascending: false });

    // Aplicar filtros
    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    // Aplicar filtros de data
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
      console.error('Error fetching anthropometry data:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error in getAnthropometryData:', error);
    return { success: false, error: error.message };
  }
};

export const getLatestAnthropometryByPatient = async (
  userId: string,
  patientId: string
) => {
  return getAnthropometryData(userId, { patientId, limit: 1 });
};
