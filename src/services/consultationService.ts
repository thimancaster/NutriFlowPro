
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Consultation, ConsultationCreateInput, ConsultationUpdateInput } from '@/types/consultationTypes';

export const consultationService = {
  // Create a new consultation record
  async createConsultation(consultationData: ConsultationCreateInput): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const consultationRecord = {
        id: uuidv4(),
        ...consultationData,
        date: consultationData.date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('consultations')
        .insert([consultationRecord])
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data: data as Consultation
      };
    } catch (error: any) {
      console.error('Error in createConsultation:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create consultation' 
      };
    }
  },

  // Get consultations for a specific patient (for evolution chart)
  async getPatientConsultations(patientId: string): Promise<{ success: boolean; data?: Consultation[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: true });

      if (error) {
        throw new Error(`Error fetching consultations: ${error.message}`);
      }

      return { 
        success: true, 
        data: (data as Consultation[]) || []
      };
    } catch (error: any) {
      console.error('Error in getPatientConsultations:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch consultations' 
      };
    }
  },

  // Get a specific consultation
  async getConsultation(id: string): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data: data as Consultation
      };
    } catch (error: any) {
      console.error('Error in getConsultation:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch consultation' 
      };
    }
  },

  // Update an existing consultation
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

      if (error) {
        throw new Error(`Error updating consultation: ${error.message}`);
      }

      return { 
        success: true, 
        data: data as Consultation
      };
    } catch (error: any) {
      console.error('Error in updateConsultation:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update consultation' 
      };
    }
  },

  // Save consultation - alias for updateConsultation to maintain compatibility
  async saveConsultation(id: string, updates: ConsultationUpdateInput): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    return this.updateConsultation(id, updates);
  },

  // Calculate BMI from weight and height
  calculateBMI(weight: number, height: number): number {
    const heightInMeters = height > 10 ? height / 100 : height;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  },

  // Get evolution data for charts
  async getEvolutionData(patientId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('date, metrics, created_at')
        .eq('patient_id', patientId)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Process data for chart consumption
      const evolutionData = (data || []).map((consultation, index) => ({
        consultation_number: index + 1,
        date: consultation.date,
        weight: consultation.metrics?.weight || 0,
        bmi: consultation.metrics?.bmi || 0,
        objective: consultation.metrics?.objective || 'manutenção'
      }));

      return { 
        success: true, 
        data: evolutionData
      };
    } catch (error: any) {
      console.error('Error in getEvolutionData:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to fetch evolution data' 
      };
    }
  }
};

export default consultationService;
