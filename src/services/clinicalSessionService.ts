import { supabase } from '@/integrations/supabase/client';

export interface ClinicalSession {
  id: string;
  user_id: string;
  patient_id: string;
  status: 'draft' | 'in_progress' | 'completed';
  session_type: 'consultation' | 'follow_up';
  consultation_data: Record<string, any>;
  nutritional_results: Record<string, any>;
  meal_plan_draft: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ClinicalSessionCreatePayload {
  patient_id: string;
  session_type?: 'consultation' | 'follow_up';
  consultation_data?: Record<string, any>;
  nutritional_results?: Record<string, any>;
  meal_plan_draft?: Record<string, any>;
  notes?: string;
}

export interface ClinicalSessionUpdatePayload {
  status?: 'draft' | 'in_progress' | 'completed';
  consultation_data?: Record<string, any>;
  nutritional_results?: Record<string, any>;
  meal_plan_draft?: Record<string, any>;
  notes?: string;
  completed_at?: string;
}

export const ClinicalSessionService = {
  /**
   * Create a new clinical session with optional initial data
   * If initialData is provided, the session will be pre-filled
   */
  async createClinicalSession(
    patientId: string, 
    initialData?: {
      consultation_data?: Record<string, any>;
      nutritional_results?: Record<string, any>;
      session_type?: 'consultation' | 'follow_up';
    }
  ): Promise<{ success: boolean; data?: ClinicalSession; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const sessionData = {
        user_id: user.id,
        patient_id: patientId,
        session_type: initialData?.session_type || 'consultation',
        consultation_data: initialData?.consultation_data || {},
        nutritional_results: initialData?.nutritional_results || {},
        meal_plan_draft: {},
        notes: ''
      };

      const { data, error } = await supabase
        .from('clinical_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as ClinicalSession };
    } catch (error: any) {
      console.error('Error creating clinical session:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get the most recent completed session for a patient
   * Used for pre-filling follow-up appointments
   */
  async getLatestCompletedSession(patientId: string): Promise<{ success: boolean; data?: ClinicalSession; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('clinical_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      return { success: true, data: data as ClinicalSession | undefined };
    } catch (error: any) {
      console.error('Error fetching latest completed session:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all sessions for a patient for evolution charts
   * Returns sessions ordered by date (oldest first)
   */
  async getAllSessions(patientId: string): Promise<{ success: boolean; data?: ClinicalSession[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('clinical_sessions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, data: data as ClinicalSession[] || [] };
    } catch (error: any) {
      console.error('Error fetching all sessions:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a specific clinical session by ID
   */
  async getClinicalSession(sessionId: string): Promise<{ success: boolean; data?: ClinicalSession; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('clinical_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return { success: true, data: data as ClinicalSession };
    } catch (error: any) {
      console.error('Error fetching clinical session:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a clinical session
   */
  async updateClinicalSession(
    sessionId: string, 
    updates: ClinicalSessionUpdatePayload
  ): Promise<{ success: boolean; data?: ClinicalSession; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // If completing the session, set completed_at
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('clinical_sessions')
        .update(updates)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data: data as ClinicalSession };
    } catch (error: any) {
      console.error('Error updating clinical session:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a clinical session
   */
  async deleteClinicalSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('clinical_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting clinical session:', error);
      return { success: false, error: error.message };
    }
  }
};