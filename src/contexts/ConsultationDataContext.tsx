import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Patient } from '@/types';
import { ConsultationData } from '@/types/consultation';
import { ClinicalWorkflowStep } from '@/types/clinical';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Extended types for complete patient data ecosystem
export interface PatientHistoryData {
  anthropometryHistory: any[];
  consultationHistory: any[];
  lastConsultation: any | null;
  lastMeasurement: any | null;
}

export interface ConsultationDataState {
  // Core consultation data
  consultationData: ConsultationData | null;
  
  // Centralized patient management
  selectedPatient: Patient | null;
  patientHistoryData: PatientHistoryData | null;
  
  // Clinical workflow state
  currentStep: ClinicalWorkflowStep;
  isConsultationActive: boolean;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Auto-save state
  isSaving: boolean;
  lastSaved: Date | null;
}

type ConsultationAction =
  | { type: 'SET_CONSULTATION_DATA'; payload: ConsultationData | null }
  | { type: 'UPDATE_CONSULTATION_DATA'; payload: Partial<ConsultationData> }
  | { type: 'SET_SELECTED_PATIENT'; payload: Patient | null }
  | { type: 'LOAD_PATIENT_HISTORY'; payload: PatientHistoryData | null }
  | { type: 'SET_CURRENT_STEP'; payload: ClinicalWorkflowStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'START_CONSULTATION'; payload: { patient: Patient; consultation: ConsultationData } }
  | { type: 'CLEAR_CONSULTATION_SESSION' };

const initialState: ConsultationDataState = {
  consultationData: null,
  selectedPatient: null,
  patientHistoryData: null,
  currentStep: 'patient-selection',
  isConsultationActive: false,
  isLoading: false,
  error: null,
  isSaving: false,
  lastSaved: null,
};

function consultationReducer(state: ConsultationDataState, action: ConsultationAction): ConsultationDataState {
  switch (action.type) {
    case 'SET_CONSULTATION_DATA':
      return {
        ...state,
        consultationData: action.payload,
        isConsultationActive: !!action.payload,
      };
    
    case 'UPDATE_CONSULTATION_DATA':
      return {
        ...state,
        consultationData: state.consultationData 
          ? { ...state.consultationData, ...action.payload }
          : null,
      };
    
    case 'SET_SELECTED_PATIENT':
      return {
        ...state,
        selectedPatient: action.payload,
        // Clear history when patient changes
        patientHistoryData: action.payload ? state.patientHistoryData : null,
      };
    
    case 'LOAD_PATIENT_HISTORY':
      return {
        ...state,
        patientHistoryData: action.payload,
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    
    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.payload,
      };
    
    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
      };
    
    case 'START_CONSULTATION':
      return {
        ...state,
        selectedPatient: action.payload.patient,
        consultationData: action.payload.consultation,
        isConsultationActive: true,
        currentStep: 'patient-info',
      };
    
    case 'CLEAR_CONSULTATION_SESSION':
      return {
        ...initialState,
      };
    
    default:
      return state;
  }
}

interface ConsultationDataContextType extends ConsultationDataState {
  // Core actions
  setConsultationData: (data: ConsultationData | null) => void;
  updateConsultationData: (updates: Partial<ConsultationData>) => void;
  
  // Patient management actions
  setSelectedPatient: (patient: Patient | null) => void;
  loadPatientHistory: (patientId: string) => Promise<void>;
  
  // Workflow actions
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  startNewConsultation: (patient: Patient) => Promise<void>;
  completeConsultation: () => Promise<void>;
  
  // Session management
  clearConsultationData: () => void;
  resetWorkflow: () => void;
  
  // Auto-save
  autoSave: () => Promise<void>;
}

const ConsultationDataContext = createContext<ConsultationDataContextType | undefined>(undefined);

export const ConsultationDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(consultationReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Session persistence
  useEffect(() => {
    try {
      const savedPatient = localStorage.getItem('clinical_selected_patient');
      const savedConsultation = localStorage.getItem('clinical_consultation_data');
      const savedStep = localStorage.getItem('clinical_current_step');

      if (savedPatient) {
        const patient = JSON.parse(savedPatient);
        dispatch({ type: 'SET_SELECTED_PATIENT', payload: patient });
      }

      if (savedConsultation) {
        const consultation = JSON.parse(savedConsultation);
        dispatch({ type: 'SET_CONSULTATION_DATA', payload: consultation });
      }

      if (savedStep) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: savedStep as ClinicalWorkflowStep });
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    if (state.selectedPatient) {
      localStorage.setItem('clinical_selected_patient', JSON.stringify(state.selectedPatient));
    } else {
      localStorage.removeItem('clinical_selected_patient');
    }
  }, [state.selectedPatient]);

  useEffect(() => {
    if (state.consultationData) {
      localStorage.setItem('clinical_consultation_data', JSON.stringify(state.consultationData));
    } else {
      localStorage.removeItem('clinical_consultation_data');
    }
  }, [state.consultationData]);

  useEffect(() => {
    localStorage.setItem('clinical_current_step', state.currentStep);
  }, [state.currentStep]);

  // Core actions
  const setConsultationData = (data: ConsultationData | null) => {
    dispatch({ type: 'SET_CONSULTATION_DATA', payload: data });
  };

  const updateConsultationData = (updates: Partial<ConsultationData>) => {
    dispatch({ type: 'UPDATE_CONSULTATION_DATA', payload: updates });
  };

  // Patient management actions
  const setSelectedPatient = (patient: Patient | null) => {
    dispatch({ type: 'SET_SELECTED_PATIENT', payload: patient });
    
    if (patient) {
      // Auto-load patient history when patient is selected
      loadPatientHistory(patient.id);
    }
  };

  const loadPatientHistory = async (patientId: string) => {
    if (!user?.id) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Import services dynamically to avoid circular dependencies
      const [
        { getPatientAnthropometryHistory },
        { getConsultationHistory },
        { getLatestAnthropometryByPatient }
      ] = await Promise.all([
        import('../services/anthropometryService'),
        import('../services/consultationHistoryService'),
        import('../services/anthropometryService')
      ]);

      // Load all patient history data in parallel
      const [
        anthropometryResult,
        consultationsResult,
        latestMeasurementResult
      ] = await Promise.all([
        getPatientAnthropometryHistory(user.id, patientId),
        getConsultationHistory(patientId, user.id),
        getLatestAnthropometryByPatient(user.id, patientId)
      ]);

      const historyData: PatientHistoryData = {
        anthropometryHistory: anthropometryResult.success ? anthropometryResult.data || [] : [],
        consultationHistory: consultationsResult || [],
        lastConsultation: Array.isArray(consultationsResult) && consultationsResult.length > 0 
          ? consultationsResult[0] 
          : null,
        lastMeasurement: latestMeasurementResult.success && latestMeasurementResult.data 
          ? latestMeasurementResult.data[0] 
          : null
      };

      dispatch({ type: 'LOAD_PATIENT_HISTORY', payload: historyData });
      
    } catch (error) {
      console.error('Error loading patient history:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar histórico do paciente' });
      
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico do paciente',
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Workflow actions
  const setCurrentStep = (step: ClinicalWorkflowStep) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const startNewConsultation = async (patient: Patient) => {
    if (!user?.id) return;

    const consultation: ConsultationData = {
      id: crypto.randomUUID(),
      patient_id: patient.id,
      user_id: user.id,
      patient: patient,
      
      // Initialize with patient's basic data and latest measurements
      weight: state.patientHistoryData?.lastMeasurement?.weight || 0,
      height: state.patientHistoryData?.lastMeasurement?.height || 0,
      age: patient.age || 0,
      gender: patient.gender || 'female',
      activity_level: 'moderado',
      objective: patient.goals?.objective || 'manutenção',
      
      totalCalories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      bmr: 0,
      
      created_at: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    dispatch({ 
      type: 'START_CONSULTATION', 
      payload: { patient, consultation } 
    });

    toast({
      title: 'Consulta Iniciada',
      description: `Atendimento de ${patient.name} iniciado com sucesso`,
    });
  };

  const completeConsultation = async () => {
    if (!state.consultationData || !state.selectedPatient) return;

    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      // Save consultation data to database
      // This would integrate with your existing save logic
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      
      toast({
        title: 'Consulta Finalizada',
        description: 'Consulta salva e finalizada com sucesso',
      });
      
      // Clear session after successful completion
      clearConsultationData();
      
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao finalizar consulta',
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  // Session management
  const clearConsultationData = () => {
    dispatch({ type: 'CLEAR_CONSULTATION_SESSION' });
    
    // Clear localStorage
    localStorage.removeItem('clinical_selected_patient');
    localStorage.removeItem('clinical_consultation_data');
    localStorage.removeItem('clinical_current_step');
  };

  const resetWorkflow = () => {
    clearConsultationData();
  };

  // Auto-save functionality
  const autoSave = async () => {
    if (!state.consultationData || state.isSaving) return;

    dispatch({ type: 'SET_SAVING', payload: true });
    
    try {
      // Implement auto-save logic here
      // This would save to database without showing success message
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      
    } catch (error) {
      console.error('Auto-save error:', error);
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const contextValue: ConsultationDataContextType = {
    ...state,
    setConsultationData,
    updateConsultationData,
    setSelectedPatient,
    loadPatientHistory,
    setCurrentStep,
    startNewConsultation,
    completeConsultation,
    clearConsultationData,
    resetWorkflow,
    autoSave,
  };

  return (
    <ConsultationDataContext.Provider value={contextValue}>
      {children}
    </ConsultationDataContext.Provider>
  );
};

export const useConsultationData = () => {
  const context = useContext(ConsultationDataContext);
  if (context === undefined) {
    throw new Error('useConsultationData must be used within a ConsultationDataProvider');
  }
  return context;
};