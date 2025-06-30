
import { useCallback, useEffect, useState } from 'react';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { ConsultationData } from '@/types';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalSessionData {
  id?: string;
  patient_id: string;
  user_id: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  clinical_data: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: 'male' | 'female';
    activity_level?: string;
    goal?: string;
    bmr?: number;
    tdee?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    notes?: string;
  };
  created_at: string;
  updated_at?: string;
}

export const useClinicalIntegration = () => {
  const { activePatient } = usePatient();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentSession, setCurrentSession] = useState<ClinicalSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Auto-create session when patient is selected
  useEffect(() => {
    if (activePatient && user && !currentSession) {
      initializeClinicalSession();
    }
  }, [activePatient, user]);

  const initializeClinicalSession = useCallback(async () => {
    if (!activePatient || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const newSession: ClinicalSessionData = {
        patient_id: activePatient.id,
        user_id: user.id,
        status: 'in_progress',
        clinical_data: {
          // Pre-fill with patient data if available
          gender: activePatient.gender as 'male' | 'female' || 'female',
        },
        created_at: new Date().toISOString(),
      };

      setCurrentSession(newSession);
      console.log('Clinical session initialized for patient:', activePatient.name);

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error initializing clinical session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient, user]);

  const updateClinicalData = useCallback(async (updates: Partial<ClinicalSessionData['clinical_data']>) => {
    if (!currentSession) return;

    try {
      const updatedSession = {
        ...currentSession,
        clinical_data: {
          ...currentSession.clinical_data,
          ...updates,
        },
        updated_at: new Date().toISOString(),
      };

      setCurrentSession(updatedSession);
      console.log('Clinical data updated:', updates);

      // Auto-save to localStorage for persistence
      localStorage.setItem(
        `clinical_session_${currentSession.patient_id}`, 
        JSON.stringify(updatedSession)
      );

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error updating clinical data:', error);
    }
  }, [currentSession]);

  const completeClinicalSession = useCallback(async () => {
    if (!currentSession) return false;

    setIsLoading(true);
    try {
      const completedSession = {
        ...currentSession,
        status: 'completed' as const,
        updated_at: new Date().toISOString(),
      };

      setCurrentSession(completedSession);
      
      // Clear from localStorage
      localStorage.removeItem(`clinical_session_${currentSession.patient_id}`);
      
      toast({
        title: "Sessão Clínica Finalizada",
        description: "Dados salvos com sucesso."
      });

      console.log('Clinical session completed:', completedSession);
      return true;

    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error completing clinical session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, toast]);

  const convertToConsultationData = useCallback((): ConsultationData | null => {
    if (!currentSession || !activePatient) return null;

    const { clinical_data } = currentSession;
    
    return {
      id: currentSession.id || `temp_${Date.now()}`,
      patient_id: currentSession.patient_id,
      user_id: currentSession.user_id,
      weight: clinical_data.weight || 0,
      height: clinical_data.height || 0,
      age: clinical_data.age || 0,
      gender: clinical_data.gender || 'female',
      activity_level: clinical_data.activity_level || 'moderado',
      objective: clinical_data.goal || 'manutenção',
      bmr: clinical_data.bmr || 0,
      totalCalories: clinical_data.tdee || 0,
      protein: clinical_data.protein || 0,
      carbs: clinical_data.carbs || 0,
      fats: clinical_data.fats || 0,
      notes: clinical_data.notes,
      date: new Date().toISOString().split('T')[0],
      created_at: currentSession.created_at,
      results: {
        bmr: clinical_data.bmr || 0,
        get: clinical_data.tdee || 0,
        vet: clinical_data.tdee || 0,
        adjustment: 0,
        macros: {
          protein: clinical_data.protein || 0,
          carbs: clinical_data.carbs || 0,
          fat: clinical_data.fats || 0,
        }
      }
    };
  }, [currentSession, activePatient]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setError(null);
    if (activePatient) {
      localStorage.removeItem(`clinical_session_${activePatient.id}`);
    }
  }, [activePatient]);

  return {
    // State
    currentSession,
    isLoading,
    error,
    
    // Actions
    initializeClinicalSession,
    updateClinicalData,
    completeClinicalSession,
    resetSession,
    
    // Utilities
    convertToConsultationData,
    
    // Status
    hasActiveSession: !!currentSession,
    isSessionComplete: currentSession?.status === 'completed',
  };
};
