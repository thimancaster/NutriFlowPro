
import { supabase } from '@/integrations/supabase/client';

export interface ConsultationCreatePayload {
  patient_id: string;
  calculation_id?: string;
  meal_plan_id?: string;
  date: string;
  metrics: {
    weight?: number;
    height?: number;
    bmi?: number;
    objective?: string;
    bmr?: number;
    tdee?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
  notes?: string;
}

export interface ConsultationRecord {
  id: string;
  patient_id: string;
  calculation_id?: string;
  meal_plan_id?: string;
  date: string;
  metrics: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const ConsultationService = {
  async create(payload: ConsultationCreatePayload): Promise<{ success: boolean; data?: ConsultationRecord; error?: string }> {
    console.log('[ATTEND:E2E] Creating consultation record:', payload);
    
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          patient_id: payload.patient_id,
          calculation_id: payload.calculation_id,
          meal_plan_id: payload.meal_plan_id,
          date: payload.date,
          metrics: payload.metrics,
          notes: payload.notes
        })
        .select()
        .single();

      if (error) throw error;

      console.log('[ATTEND:E2E] Consultation created successfully');
      return { success: true, data: data as ConsultationRecord };
    } catch (error: any) {
      console.error('[ATTEND:E2E] Error creating consultation:', error);
      return { success: false, error: error.message };
    }
  },

  async listByPatient(patientId: string): Promise<{ success: boolean; data?: ConsultationRecord[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { success: true, data: data as ConsultationRecord[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getEvolutionData(patientId: string): Promise<{ success: boolean; data?: Array<{ date: string; weight: number; bmi?: number; objective?: string }>; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('date, metrics')
        .eq('patient_id', patientId)
        .order('date', { ascending: true });

      if (error) throw error;

      const evolutionData = (data || []).map((consultation: any) => {
        const metrics = typeof consultation.metrics === 'object' ? consultation.metrics : {};
        return {
          date: consultation.date,
          weight: metrics.weight || 0,
          bmi: metrics.bmi,
          objective: metrics.objective
        };
      });

      return { success: true, data: evolutionData };
    } catch (error: any) {
      console.error('Error fetching evolution data:', error);
      return { success: false, error: error.message };
    }
  }
};
