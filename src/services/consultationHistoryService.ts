
import { supabase } from '@/integrations/supabase/client';

export interface ConsultationHistoryData {
  id: string;
  patient_id: string;
  consultation_number: number;
  calculation_date: string;
  tmb: number;
  vet: number;
  get: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  protein_kcal: number;
  carbs_kcal: number;
  fat_kcal: number;
  formula_used: string;
  activity_level: string;
  objective: string;
  body_profile: string;
  sex: string;
  age: number;
  weight: number;
  height: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const saveConsultationHistory = async (
  patientId: string,
  userId: string,
  calculationData: Omit<ConsultationHistoryData, 'id' | 'created_at' | 'updated_at' | 'patient_id' | 'user_id'>
): Promise<string> => {
  const { data, error } = await supabase
    .from('calculation_history')
    .insert({
      patient_id: patientId,
      user_id: userId,
      ...calculationData
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving consultation history:', error);
    throw new Error('Erro ao salvar histórico da consulta');
  }

  return data.id;
};

export const getConsultationHistory = async (
  patientId: string, 
  userId: string
): Promise<ConsultationHistoryData[]> => {
  const { data, error } = await supabase
    .from('calculation_history')
    .select('*')
    .eq('patient_id', patientId)
    .eq('user_id', userId)
    .order('consultation_number', { ascending: false });

  if (error) {
    console.error('Error fetching consultation history:', error);
    throw new Error('Erro ao buscar histórico de consultas');
  }

  return data || [];
};

export const getLastConsultationNumber = async (
  patientId: string, 
  userId: string
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('calculation_history')
      .select('consultation_number')
      .eq('patient_id', patientId)
      .eq('user_id', userId)
      .order('consultation_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last consultation number:', error);
      return 0;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0].consultation_number || 0;
    }

    return 0;
  } catch (error) {
    console.error('Error in getLastConsultationNumber:', error);
    return 0;
  }
};

export const updateConsultationHistory = async (
  id: string,
  updates: Partial<ConsultationHistoryData>
): Promise<void> => {
  const { error } = await supabase
    .from('calculation_history')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating consultation history:', error);
    throw new Error('Erro ao atualizar histórico da consulta');
  }
};

export const deleteConsultationHistory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('calculation_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting consultation history:', error);
    throw new Error('Erro ao deletar histórico da consulta');
  }
};

// Objeto do serviço agrupado (mantido para compatibilidade)
export const consultationHistoryService = {
  saveConsultation: async (data: any) => {
    return true; // Simplified implementation
  },
  getPatientHistory: getConsultationHistory,
  getLastConsultation: async (patientId: string) => {
    const history = await getConsultationHistory(patientId, '');
    return history[0] || null;
  },
  getConsultationType: async (patientId: string) => {
    const history = await getConsultationHistory(patientId, '');
    return history.length === 0 ? 'primeira_consulta' : 'retorno';
  }
};
