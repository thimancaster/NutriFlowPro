
import { supabase } from '@/integrations/supabase/client';

export interface ConsultationHistoryData {
  consultation_number: number;
  weight: number;
  height: number;
  age: number;
  sex: 'M' | 'F';
  body_profile: string;
  activity_level: string;
  objective: string;
  tmb: number;
  get_value: number;
  vet: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calculation_date: string;
}

export const consultationHistoryService = {
  /**
   * Buscar histórico completo de consultas de um paciente
   */
  async getPatientHistory(patientId: string): Promise<ConsultationHistoryData[]> {
    try {
      const { data, error } = await supabase
        .from('calculation_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('consultation_number', { ascending: false });

      if (error) {
        console.error('Error fetching patient history:', error);
        return [];
      }

      return data.map(item => ({
        consultation_number: item.consultation_number,
        weight: item.weight,
        height: item.height,
        age: item.age,
        sex: (item.sex as 'M' | 'F') || 'F', // Type assertion with fallback
        body_profile: item.body_profile,
        activity_level: item.activity_level,
        objective: item.objective,
        tmb: item.tmb,
        get_value: item.get,
        vet: item.vet,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        calculation_date: item.calculation_date
      }));
    } catch (error) {
      console.error('Error in getPatientHistory:', error);
      return [];
    }
  },

  /**
   * Buscar dados da última consulta usando a função do banco
   */
  async getLastConsultation(patientId: string): Promise<ConsultationHistoryData | null> {
    try {
      const { data, error } = await supabase.rpc('get_patient_last_consultation', {
        p_patient_id: patientId
      });

      if (error) {
        console.error('Error fetching last consultation:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const consultation = data[0];
      return {
        consultation_number: consultation.consultation_number,
        weight: consultation.weight,
        height: consultation.height,
        age: consultation.age,
        sex: (consultation.sex as 'M' | 'F') || 'F', // Type assertion with fallback
        body_profile: consultation.body_profile,
        activity_level: consultation.activity_level,
        objective: consultation.objective,
        tmb: consultation.tmb,
        get_value: consultation.get_value,
        vet: consultation.vet,
        protein_g: consultation.protein_g,
        carbs_g: consultation.carbs_g,
        fat_g: consultation.fat_g,
        calculation_date: consultation.calculation_date
      };
    } catch (error) {
      console.error('Error in getLastConsultation:', error);
      return null;
    }
  },

  /**
   * Salvar nova consulta no histórico
   */
  async saveConsultation(consultationData: {
    patient_id: string;
    user_id: string;
    weight: number;
    height: number;
    age: number;
    sex: 'M' | 'F';
    body_profile: string;
    activity_level: string;
    objective: string;
    tmb: number;
    get: number;
    vet: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    protein_kcal: number;
    carbs_kcal: number;
    fat_kcal: number;
    formula_used: string;
    notes?: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('calculation_history')
        .insert([consultationData]);

      if (error) {
        console.error('Error saving consultation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveConsultation:', error);
      return false;
    }
  },

  /**
   * Determinar se é primeira consulta ou retorno
   */
  async getConsultationType(patientId: string): Promise<'primeira_consulta' | 'retorno'> {
    try {
      const { data, error } = await supabase
        .from('calculation_history')
        .select('id')
        .eq('patient_id', patientId)
        .limit(1);

      if (error) {
        console.error('Error checking consultation type:', error);
        return 'primeira_consulta';
      }

      return data && data.length > 0 ? 'retorno' : 'primeira_consulta';
    } catch (error) {
      console.error('Error in getConsultationType:', error);
      return 'primeira_consulta';
    }
  }
};
