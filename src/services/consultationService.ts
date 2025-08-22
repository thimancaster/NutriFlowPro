
import { supabase } from '@/integrations/supabase/client';
import { Consultation, ConsultationCreateInput, ConsultationUpdateInput } from '@/types/consultationTypes';

export const ConsultationService = {
  async createConsultation(consultationData: ConsultationCreateInput): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as Consultation };
    } catch (error: any) {
      console.error('Error creating consultation:', error);
      return { success: false, error: error.message };
    }
  },

  async getConsultation(id: string): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { success: true, data: data as Consultation };
    } catch (error: any) {
      console.error('Error fetching consultation:', error);
      return { success: false, error: error.message };
    }
  },

  async listConsultationsByPatient(patientId: string): Promise<{ success: boolean; data?: Consultation[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { success: true, data: (data as Consultation[]) || [] };
    } catch (error: any) {
      console.error('Error listing consultations:', error);
      return { success: false, error: error.message };
    }
  },

  async updateConsultation(id: string, updates: ConsultationUpdateInput): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as Consultation };
    } catch (error: any) {
      console.error('Error updating consultation:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteConsultation(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting consultation:', error);
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
