
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConsultationData, Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';

interface ConsultationDataState {
  consultationData: ConsultationData | null;
  isConsultationActive: boolean;
  currentStep: string;
  isSaving: boolean;
  lastSaved: Date | null;
}

interface ConsultationDataActions {
  setCurrentStep: (step: string) => void;
  updateConsultationData: (data: Partial<ConsultationData>) => void;
  completeConsultation: () => Promise<void>;
  autoSave: () => Promise<void>;
  reset: () => void;
}

interface ConsultationDataContextType {
  state: ConsultationDataState;
  consultationData: ConsultationData | null;
  isConsultationActive: boolean;
  currentStep: string;
  isSaving: boolean;
  lastSaved: Date | null;
  setCurrentStep: (step: string) => void;
  updateConsultationData: (data: Partial<ConsultationData>) => void;
  completeConsultation: () => Promise<void>;
  autoSave: () => Promise<void>;
  reset: () => void;
  isLoading: boolean;
  startNewConsultation: (patient: Patient) => Promise<void>;
  // Legacy compatibility - use PatientContext instead
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  patientHistoryData: any[];
  setConsultationData: (data: ConsultationData | null) => void;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use PatientContext as single source of truth for patient data
  const { 
    activePatient,
    setActivePatient, 
    startPatientSession,
    patientHistoryData,
    isLoading: patientLoading 
  } = usePatient();
  
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('patient-selection');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isConsultationActive = activePatient !== null && consultationData !== null;

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!consultationData || !activePatient || !user?.id) return;
    
    setIsSaving(true);
    try {
      // Transform data to match Supabase schema
      const saveData = {
        id: consultationData.id,
        user_id: user.id,
        patient_id: activePatient.id,
        age: consultationData.age || activePatient.age || 0,
        weight: consultationData.weight || 0,
        height: consultationData.height || 0,
        gender: consultationData.gender || 'M',
        activity_level: consultationData.activity_level || 'moderado',
        goal: consultationData.objective || 'manutenção',
        bmr: consultationData.bmr || 0,
        protein: consultationData.protein || 0,
        carbs: consultationData.carbs || 0,
        fats: consultationData.fats || 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('calculations')
        .upsert(saveData);

      if (error) throw error;
      
      setLastSaved(new Date());
      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [consultationData, activePatient, user?.id]);

  const updateConsultationData = useCallback((data: Partial<ConsultationData>) => {
    setConsultationData(prev => prev ? { ...prev, ...data } : null);
  }, []);

  const startNewConsultation = useCallback(async (patient: Patient) => {
    // Use PatientContext to set the active patient
    startPatientSession(patient);
    
    // Initialize consultation data
    const newConsultation: ConsultationData = {
      id: crypto.randomUUID(),
      patient_id: patient.id,
      weight: 0,
      height: 0,
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0,
      gender: 'M',
      activity_level: 'moderado',
      patient: {
        name: patient.name,
        id: patient.id
      },
      results: {
        bmr: 0,
        get: 0,
        vet: 0,
        adjustment: 0,
        macros: {
          protein: 0,
          carbs: 0,
          fat: 0
        }
      }
    };
    
    setConsultationData(newConsultation);
    setCurrentStep('evaluation');
  }, [startPatientSession]);

  const completeConsultation = useCallback(async () => {
    if (!consultationData || !activePatient) return;
    
    try {
      await autoSave();
      toast({
        title: 'Consulta finalizada',
        description: 'Dados salvos com sucesso!'
      });
      
      // Reset consultation but keep patient active
      setConsultationData(null);
      setCurrentStep('patient-selection');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar consulta',
        variant: 'destructive'
      });
    }
  }, [consultationData, activePatient, autoSave, toast]);

  const reset = useCallback(() => {
    setConsultationData(null);
    setCurrentStep('patient-selection');
    setLastSaved(null);
  }, []);

  // Auto-save every 30 seconds when there's consultation data
  useEffect(() => {
    if (!isConsultationActive) return;
    
    const interval = setInterval(() => {
      autoSave();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isConsultationActive, autoSave]);

  const contextValue: ConsultationDataContextType = {
    state: {
      consultationData,
      isConsultationActive,
      currentStep,
      isSaving,
      lastSaved
    },
    consultationData,
    isConsultationActive,
    currentStep,
    isSaving,
    lastSaved,
    setCurrentStep,
    updateConsultationData,
    completeConsultation,
    autoSave,
    reset,
    isLoading: patientLoading,
    startNewConsultation,
    // Legacy compatibility - delegate to PatientContext
    selectedPatient: activePatient,
    setSelectedPatient: setActivePatient,
    patientHistoryData,
    setConsultationData
  };

  return (
    <ConsultationDataContext.Provider value={contextValue}>
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (!context) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};
