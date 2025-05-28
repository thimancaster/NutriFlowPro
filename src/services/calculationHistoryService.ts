
import { supabase } from '@/integrations/supabase/client';

export interface CalculationHistory {
  id: string;
  patient_id: string;
  user_id: string;
  calculation_date: string;
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
  created_at: string;
  updated_at: string;
}

export interface CreateCalculationHistory {
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
}

export const calculationHistoryService = {
  /**
   * Save a new calculation to history
   */
  async saveCalculation(data: CreateCalculationHistory): Promise<CalculationHistory> {
    const { data: result, error } = await supabase
      .from('calculation_history')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save calculation: ${error.message}`);
    }

    return result as CalculationHistory;
  },

  /**
   * Get calculation history for a patient
   */
  async getPatientHistory(
    patientId: string,
    period?: 'month' | '3months' | '6months' | 'year' | 'all'
  ): Promise<CalculationHistory[]> {
    let query = supabase
      .from('calculation_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('calculation_date', { ascending: false });

    // Apply period filter
    if (period && period !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case '3months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case '6months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          break;
        case 'year':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          startDate = new Date(0); // All time
      }

      query = query.gte('calculation_date', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch calculation history: ${error.message}`);
    }

    return (data || []) as CalculationHistory[];
  },

  /**
   * Get the latest calculation for a patient
   */
  async getLatestCalculation(patientId: string): Promise<CalculationHistory | null> {
    const { data, error } = await supabase
      .from('calculation_history')
      .select('*')
      .eq('patient_id', patientId)
      .order('calculation_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch latest calculation: ${error.message}`);
    }

    return data as CalculationHistory || null;
  },

  /**
   * Delete a calculation from history
   */
  async deleteCalculation(calculationId: string): Promise<void> {
    const { error } = await supabase
      .from('calculation_history')
      .delete()
      .eq('id', calculationId);

    if (error) {
      throw new Error(`Failed to delete calculation: ${error.message}`);
    }
  },

  /**
   * Update calculation notes
   */
  async updateNotes(calculationId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('calculation_history')
      .update({ notes })
      .eq('id', calculationId);

    if (error) {
      throw new Error(`Failed to update notes: ${error.message}`);
    }
  }
};
