
import { supabase } from "@/integrations/supabase/client";

export interface AnthropometryFilters {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface AnthropometryMeasurement {
  patient_id: string;
  date: string;
  weight?: number;
  height?: number;
  imc?: number;
  body_fat_pct?: number;
  lean_mass_kg?: number;
  muscle_mass_percentage?: number;
  water_percentage?: number;
  arm?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  calf?: number;
  chest?: number;
  abdominal?: number;
  subscapular?: number;
  suprailiac?: number;
  triceps?: number;
  rcq?: number;
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
        muscle_mass_percentage,
        water_percentage,
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

export const getPatientAnthropometryHistory = async (
  userId: string,
  patientId: string
) => {
  try {
    const { data, error } = await supabase
      .from('anthropometry')
      .select(`
        id,
        date,
        weight,
        height,
        imc,
        body_fat_pct,
        lean_mass_kg,
        muscle_mass_percentage,
        water_percentage,
        arm,
        waist,
        hip,
        thigh,
        calf,
        chest,
        abdominal,
        subscapular,
        suprailiac,
        triceps
      `)
      .eq('user_id', userId)
      .eq('patient_id', patientId)
      .order('date', { ascending: true }); // Ascendente para gráficos

    if (error) {
      console.error('Error fetching patient anthropometry history:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error in getPatientAnthropometryHistory:', error);
    return { success: false, error: error.message };
  }
};

export const saveMeasurement = async (
  measurementData: AnthropometryMeasurement,
  userId: string
) => {
  try {
    console.log('Saving anthropometry measurement:', measurementData);

    const { data, error } = await supabase
      .from('anthropometry')
      .insert({
        ...measurementData,
        user_id: userId,
        date: measurementData.date || new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving measurement:', error);
      return { success: false, error: error.message };
    }

    console.log('Measurement saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in saveMeasurement:', error);
    return { success: false, error: error.message };
  }
};

export const updateMeasurement = async (
  measurementId: string,
  measurementData: Partial<AnthropometryMeasurement>,
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from('anthropometry')
      .update(measurementData)
      .eq('id', measurementId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating measurement:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error in updateMeasurement:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMeasurement = async (
  measurementId: string,
  userId: string
) => {
  try {
    const { error } = await supabase
      .from('anthropometry')
      .delete()
      .eq('id', measurementId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting measurement:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteMeasurement:', error);
    return { success: false, error: error.message };
  }
};
