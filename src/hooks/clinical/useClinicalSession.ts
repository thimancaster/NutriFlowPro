
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClinicalSessionData {
  id: string;
  patient_id: string;
  appointment_id?: string;
  user_id: string;
  clinical_data: Record<string, any>;
  status: 'draft' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export const useClinicalSession = (patientId?: string, appointmentId?: string) => {
  const [session, setSession] = useState<ClinicalSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load existing session or create new one
  const loadOrCreateSession = async () => {
    if (!user?.id || !patientId) return;

    setIsLoading(true);
    try {
      // Try to find existing session
      let query = supabase
        .from('calculations')
        .select('*')
        .eq('user_id', user.id)
        .eq('patient_id', patientId)
        .eq('status', 'em_andamento')
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: existingSessions, error } = await query;

      if (error) {
        console.error('Error loading session:', error);
        return;
      }

      if (existingSessions && existingSessions.length > 0) {
        // Map existing calculation to clinical session format
        const calculation = existingSessions[0];
        const clinicalSession: ClinicalSessionData = {
          id: calculation.id,
          patient_id: calculation.patient_id,
          appointment_id: appointmentId,
          user_id: calculation.user_id,
          clinical_data: {
            weight: calculation.weight,
            height: calculation.height,
            age: calculation.age,
            gender: calculation.gender,
            activity_level: calculation.activity_level,
            goal: calculation.goal,
            bmr: calculation.bmr,
            tdee: calculation.tdee,
            protein: calculation.protein,
            carbs: calculation.carbs,
            fats: calculation.fats,
            measurements: calculation.measurements || {},
            notes: calculation.notes
          },
          status: calculation.status === 'completo' ? 'completed' : 'in_progress',
          created_at: calculation.created_at,
          updated_at: calculation.updated_at || calculation.created_at
        };
        setSession(clinicalSession);
      } else {
        // Create new session
        await createNewSession();
      }
    } catch (error) {
      console.error('Error in loadOrCreateSession:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a sessão clínica',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!user?.id || !patientId) return;

    try {
      const newSessionData = {
        user_id: user.id,
        patient_id: patientId,
        weight: 0,
        height: 0,
        age: 0,
        gender: 'female',
        activity_level: 'moderado',
        goal: 'manutenção',
        bmr: 0,
        tdee: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        status: 'em_andamento',
        measurements: {},
        notes: null
      };

      const { data, error } = await supabase
        .from('calculations')
        .insert(newSessionData)
        .select()
        .single();

      if (error) throw error;

      const clinicalSession: ClinicalSessionData = {
        id: data.id,
        patient_id: data.patient_id,
        appointment_id: appointmentId,
        user_id: data.user_id,
        clinical_data: {
          weight: data.weight,
          height: data.height,
          age: data.age,
          gender: data.gender,
          activity_level: data.activity_level,
          goal: data.goal,
          bmr: data.bmr,
          tdee: data.tdee,
          protein: data.protein,
          carbs: data.carbs,
          fats: data.fats,
          measurements: data.measurements || {},
          notes: data.notes
        },
        status: 'draft',
        created_at: data.created_at,
        updated_at: data.created_at
      };

      setSession(clinicalSession);
      
      toast({
        title: 'Sessão Criada',
        description: 'Nova sessão clínica iniciada com sucesso'
      });
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar nova sessão clínica',
        variant: 'destructive'
      });
    }
  };

  const updateSession = async (updates: Partial<ClinicalSessionData['clinical_data']>) => {
    if (!session || !user?.id) return;

    setIsSaving(true);
    try {
      const updatedClinicalData = { ...session.clinical_data, ...updates };
      
      const { error } = await supabase
        .from('calculations')
        .update({
          weight: updatedClinicalData.weight || 0,
          height: updatedClinicalData.height || 0,
          age: updatedClinicalData.age || 0,
          gender: updatedClinicalData.gender || 'female',
          activity_level: updatedClinicalData.activity_level || 'moderado',
          goal: updatedClinicalData.goal || 'manutenção',
          bmr: updatedClinicalData.bmr || 0,
          tdee: updatedClinicalData.tdee || 0,
          protein: updatedClinicalData.protein || 0,
          carbs: updatedClinicalData.carbs || 0,
          fats: updatedClinicalData.fats || 0,
          measurements: updatedClinicalData.measurements || {},
          notes: updatedClinicalData.notes,
          last_auto_save: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => prev ? {
        ...prev,
        clinical_data: updatedClinicalData,
        updated_at: new Date().toISOString()
      } : null);

    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: 'Erro ao Salvar',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const completeSession = async () => {
    if (!session) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('calculations')
        .update({
          status: 'completo',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      setSession(prev => prev ? { ...prev, status: 'completed' } : null);
      
      toast({
        title: 'Sessão Finalizada',
        description: 'Sessão clínica finalizada com sucesso'
      });
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar a sessão',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user?.id && patientId) {
      loadOrCreateSession();
    }
  }, [user?.id, patientId, appointmentId]);

  return {
    session,
    isLoading,
    isSaving,
    updateSession,
    completeSession,
    refreshSession: loadOrCreateSession
  };
};
