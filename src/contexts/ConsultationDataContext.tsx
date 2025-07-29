
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { useAuth } from '@/contexts/auth/AuthContext';
import { consultationService } from '@/services/consultationService';

interface ConsultationDataState {
  activePatient: Patient | null;
  consultationData: ConsultationData | null;
  currentStep: ClinicalWorkflowStep;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
}

type ConsultationDataAction = 
  | { type: 'SET_PATIENT'; payload: Patient | null }
  | { type: 'SET_CONSULTATION_DATA'; payload: ConsultationData | null }
  | { type: 'SET_CURRENT_STEP'; payload: ClinicalWorkflowStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'RESET' };

const initialState: ConsultationDataState = {
  activePatient: null,
  consultationData: null,
  currentStep: 'patient-selection',
  isLoading: false,
  error: null,
  isSaving: false,
  lastSaved: null,
};

function consultationDataReducer(state: ConsultationDataState, action: ConsultationDataAction): ConsultationDataState {
  switch (action.type) {
    case 'SET_PATIENT':
      return { ...state, activePatient: action.payload };
    case 'SET_CONSULTATION_DATA':
      return { ...state, consultationData: action.payload };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ConsultationDataContext = createContext<{
  state: ConsultationDataState;
  // Exposed properties for backward compatibility
  selectedPatient: Patient | null;
  consultationData: ConsultationData | null;
  isConsultationActive: boolean;
  patientHistoryData: any;
  // Actions
  setActivePatient: (patient: Patient | null) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setConsultationData: (data: ConsultationData | null) => void;
  updateConsultationData: (data: Partial<ConsultationData>) => void;
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  saveConsultationData: () => Promise<void>;
  autoSave: () => Promise<void>;
  loadPatientHistory: (patientId: string) => Promise<void>;
  reset: () => void;
} | undefined>(undefined);

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(consultationDataReducer, initialState);
  const { user } = useAuth();

  // Auto-save when consultation data changes
  useEffect(() => {
    if (state.consultationData && user?.id && !state.isSaving) {
      const saveTimer = setTimeout(() => {
        saveConsultationData();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [state.consultationData, user?.id, state.isSaving]);

  const setActivePatient = useCallback((patient: Patient | null) => {
    dispatch({ type: 'SET_PATIENT', payload: patient });
    
    // Move to next step when patient is selected
    if (patient && state.currentStep === 'patient-selection') {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'patient-info' });
    }
  }, [state.currentStep]);

  const setConsultationData = useCallback((data: ConsultationData | null) => {
    dispatch({ type: 'SET_CONSULTATION_DATA', payload: data });
  }, []);

  const updateConsultationData = useCallback((data: Partial<ConsultationData>) => {
    if (state.consultationData) {
      const updatedData = { ...state.consultationData, ...data };
      dispatch({ type: 'SET_CONSULTATION_DATA', payload: updatedData });
    }
  }, [state.consultationData]);

  const setCurrentStep = useCallback((step: ClinicalWorkflowStep) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const saveConsultationData = useCallback(async () => {
    if (!state.consultationData || !user?.id) return;

    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      await consultationService.saveConsultation({
        ...state.consultationData,
        user_id: user.id,
      });

      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.consultationData, user?.id]);

  const autoSave = useCallback(async () => {
    await saveConsultationData();
  }, [saveConsultationData]);

  const loadPatientHistory = useCallback(async (patientId: string) => {
    // Mock implementation - replace with actual history loading
    console.log('Loading patient history for:', patientId);
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    state,
    // Exposed properties for backward compatibility
    selectedPatient: state.activePatient,
    consultationData: state.consultationData,
    isConsultationActive: !!state.activePatient && !!state.consultationData,
    patientHistoryData: null, // Mock data for now
    // Actions
    setActivePatient,
    setSelectedPatient: setActivePatient, // Alias for backward compatibility
    setConsultationData,
    updateConsultationData,
    setCurrentStep,
    saveConsultationData,
    autoSave,
    loadPatientHistory,
    reset,
  };

  return (
    <ConsultationDataContext.Provider value={value}>
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
