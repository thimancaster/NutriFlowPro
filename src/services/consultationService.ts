
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface Consultation {
  id: string;
  patient_id: string;
  calculation_id?: string;
  meal_plan_id?: string;
  date: string;
  metrics: {
    weight: number;
    height?: number;
    bmi?: number;
    objective?: string;
    [key: string]: any;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const consultationService = {
  // Create a new consultation record
  async createConsultation(consultationData: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Consultation; error?: string }> {
    try {
      const consultationRecord = {
        id: uuidv4(),
        ...consultationData,
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
        .select(`
          *,
          patients(id, name, email, phone, gender),
          calculations(id, bmr, tdee, protein, carbs, fats),
          meal_plans(id, total_calories, total_protein, total_carbs, total_fats)
        `)
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
  async updateConsultation(id: string, updates: Partial<Consultation>): Promise<{ success: boolean; data?: Consultation; error?: string }> {
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

  // Calculate BMI from weight and height
  calculateBMI(weight: number, height: number): number {
    // Height should be in meters, weight in kg
    const heightInMeters = height > 10 ? height / 100 : height; // Convert cm to m if needed
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
