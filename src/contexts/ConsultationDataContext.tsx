
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ConsultationData, Patient } from '@/types';
import { PatientHistoryData } from '@/types/meal';
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
  // Legacy compatibility
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  patientHistoryData: PatientHistoryData;
  setConsultationData: (data: ConsultationData | null) => void;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

// Helper to normalize macros (extract grams if object, or use number directly)
const normalizeMacros = (m: any) => {
	if (!m) return m;
	const isObj = (x: any) => x && typeof x === 'object' && 'grams' in x;
	return {
		protein: isObj(m.protein) ? m.protein.grams ?? 0 : m.protein ?? 0,
		carbs: isObj(m.carbs) ? m.carbs.grams ?? 0 : m.carbs ?? 0,
		fat: isObj(m.fat) ? m.fat.grams ?? 0 : m.fat ?? 0
	};
};

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { 
    activePatient,
    setActivePatient, 
    startPatientSession,
    patientHistory,
    isLoading: patientLoading 
  } = usePatient();
  
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('patient-selection');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isConsultationActive = activePatient !== null && consultationData !== null;

  // Transform patient history for backward compatibility
  const patientHistoryData: PatientHistoryData = {
    lastMeasurement: patientHistory.length > 0 ? {
      date: patientHistory[0].created_at || new Date().toISOString(),
      weight: patientHistory[0].weight || 0,
      height: patientHistory[0].height || 0,
    } : undefined,
    anthropometryHistory: patientHistory.map(record => ({
      date: record.created_at || new Date().toISOString(),
      weight: record.weight || 0,
      height: record.height || 0,
      bmi: record.weight && record.height ? record.weight / Math.pow(record.height / 100, 2) : 0
    }))
  };

  // Helper to extract numeric value from potential {value, formula} objects
  const extractNumericValue = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && 'value' in val) return Number(val.value) || 0;
    return Number(val) || 0;
  };

  const autoSave = useCallback(async () => {
    if (!consultationData || !activePatient || !user?.id) return;
    
    setIsSaving(true);
    try {
      // Extract numeric values safely (handles {value, formula} objects)
      const bmrValue = extractNumericValue(consultationData.bmr);
      const tdeeValue = extractNumericValue(consultationData.results?.vet) || bmrValue;
      
      // Transform data to match Supabase schema exactly
      const saveData = {
        id: consultationData.id,
        user_id: user.id,
        patient_id: activePatient.id,
        age: Number(consultationData.age) || Number(activePatient.age) || 0,
        weight: Number(consultationData.weight) || 0,
        height: Number(consultationData.height) || 0,
        gender: consultationData.gender === 'male' ? 'M' : consultationData.gender === 'female' ? 'F' : 'M',
        activity_level: consultationData.activity_level || 'moderado',
        goal: consultationData.objective || consultationData.goal || 'manutenção',
        bmr: bmrValue,
        tdee: tdeeValue,
        protein: Number(consultationData.protein) || 0,
        carbs: Number(consultationData.carbs) || 0,
        fats: Number(consultationData.fats) || 0,
        updated_at: new Date().toISOString()
      };

      console.log('[AUTO-SAVE] Prepared data:', saveData);

      const { error } = await supabase
        .from('calculations')
        .upsert(saveData);

      if (error) throw error;
      
      setLastSaved(new Date());
      console.log('[AUTO-SAVE] Completed successfully');
    } catch (error) {
      console.error('[AUTO-SAVE] Failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [consultationData, activePatient, user?.id]);

  const updateConsultationData = useCallback((data: Partial<ConsultationData>) => {
    console.log('[CONTEXT] updateConsultationData called with:', data);
    
    // Normalize macros if they exist in results
    const normalizedData = { ...data };
    if (data.results?.macros) {
      const normalized = normalizeMacros(data.results.macros);
      console.log('[CONTEXT] Normalized macros:', normalized);
      normalizedData.results = {
        ...data.results,
        macros: normalized
      };
      // Also update root-level macro fields
      normalizedData.protein = normalized.protein;
      normalizedData.carbs = normalized.carbs;
      normalizedData.fats = normalized.fat;
    }
    
    setConsultationData(prev => {
      if (prev) {
        const updated = { ...prev, ...normalizedData };
        console.log('[CONTEXT] Updated consultationData:', {
          vet: updated.results?.vet,
          macros: updated.results?.macros,
          macroTypes: updated.results?.macros ? {
            protein: typeof updated.results.macros.protein,
            carbs: typeof updated.results.macros.carbs,
            fat: typeof updated.results.macros.fat
          } : null
        });
        return updated;
      } else if (activePatient) {
        // Create minimal consultation data if it doesn't exist
        return {
          id: crypto.randomUUID(),
          patient_id: activePatient.id,
          weight: 0,
          height: 0,
          age: 0,
          gender: 'male',
          activity_level: 'moderado',
          objective: 'manutenção',
          bmr: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          totalCalories: 0,
          ...normalizedData
        } as ConsultationData;
      }
      return null;
    });
  }, [activePatient]);

  const startNewConsultation = useCallback(async (patient: Patient) => {
    startPatientSession(patient);
    
    const newConsultation: ConsultationData = {
      id: crypto.randomUUID(),
      patient_id: patient.id,
      weight: 0,
      height: 0,
      age: patient.birth_date ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear() : 30,
      gender: patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'other',
      activity_level: 'moderado',
      objective: 'manutenção',
      bmr: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      totalCalories: 0,
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
    // Legacy compatibility
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
