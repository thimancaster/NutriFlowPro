import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Patient } from '@/types';
import { ClinicalSession, ClinicalSessionService } from '@/services/clinicalSessionService';
import { useToast } from '@/hooks/use-toast';

export type ClinicalWorkflowStep = 
  | 'patient-selection'
  | 'consultation-form'
  | 'nutritional-calculation'
  | 'meal-plan-generation'
  | 'review-and-complete';

interface ClinicalWorkflowState {
  currentStep: ClinicalWorkflowStep;
  activePatient: Patient | null;
  activeSession: ClinicalSession | null;
  isLoading: boolean;
  hasPrefilledData: boolean;
}

interface ClinicalWorkflowContextType {
  state: ClinicalWorkflowState;
  // Patient management
  setActivePatient: (patient: Patient | null) => void;
  // Session management
  startSession: (patient: Patient) => Promise<ClinicalSession | null>;
  updateSessionData: (updates: Partial<ClinicalSession>) => Promise<void>;
  completeSession: () => Promise<void>;
  // Navigation
  setCurrentStep: (step: ClinicalWorkflowStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  // Legacy properties for backward compatibility
  currentStep: ClinicalWorkflowStep;
  activeSession: ClinicalSession | null;
  activePatient: Patient | null;
  // Reset
  resetWorkflow: () => void;
}

const ClinicalWorkflowContext = createContext<ClinicalWorkflowContextType | undefined>(undefined);

const WORKFLOW_STEPS: ClinicalWorkflowStep[] = [
  'patient-selection',
  'consultation-form',
  'nutritional-calculation',
  'meal-plan-generation',
  'review-and-complete'
];

export const ClinicalWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const [state, setState] = useState<ClinicalWorkflowState>({
    currentStep: 'patient-selection',
    activePatient: null,
    activeSession: null,
    isLoading: false,
    hasPrefilledData: false
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('activeSessionId');
    if (savedSessionId) {
      loadSession(savedSessionId);
    }
  }, []);

  const loadSession = async (sessionId: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const result = await ClinicalSessionService.getClinicalSession(sessionId);
      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          activeSession: result.data!,
          isLoading: false
        }));
      } else {
        // Clear invalid session
        localStorage.removeItem('activeSessionId');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error loading session:', error);
      localStorage.removeItem('activeSessionId');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const setActivePatient = useCallback((patient: Patient | null) => {
    setState(prev => ({ ...prev, activePatient: patient }));
  }, []);

  const startSession = useCallback(async (patient: Patient): Promise<ClinicalSession | null> => {
    setState(prev => ({ ...prev, isLoading: true, activePatient: patient }));
    
    try {
      // First, check if there's an existing latest completed session for pre-filling
      const latestSessionResult = await ClinicalSessionService.getLatestCompletedSession(patient.id);
      
      let initialData: any = undefined;
      let sessionType: 'consultation' | 'follow_up' = 'consultation';
      let hasPrefilledData = false;

      if (latestSessionResult.success && latestSessionResult.data) {
        // Patient has previous sessions - this is a follow-up
        const latestSession = latestSessionResult.data;
        sessionType = 'follow_up';
        hasPrefilledData = true;
        
        // Pre-fill with latest data but reset status-dependent fields
        initialData = {
          session_type: 'follow_up',
          consultation_data: {
            ...latestSession.consultation_data,
            // Keep patient basic data but reset session-specific fields
            date: new Date().toISOString().split('T')[0],
          },
          nutritional_results: {
            // Clear previous results - will be recalculated
          }
        };

        toast({
          title: "Dados Pré-preenchidos",
          description: `Dados da última consulta de ${latestSession.created_at} foram carregados para acompanhamento.`,
        });
      }

      // Create new session with or without initial data
      const result = await ClinicalSessionService.createClinicalSession(patient.id, initialData);
      
      if (result.success && result.data) {
        const newSession = result.data;
        
        setState(prev => ({
          ...prev,
          activeSession: newSession,
          activePatient: patient,
          currentStep: 'consultation-form',
          isLoading: false,
          hasPrefilledData
        }));

        // Save session ID to localStorage for persistence
        localStorage.setItem('activeSessionId', newSession.id);
        
        toast({
          title: hasPrefilledData ? "Sessão de Acompanhamento Iniciada" : "Nova Consulta Iniciada",
          description: `Sessão clínica criada com sucesso para ${patient.name}`,
        });

        return newSession;
      } else {
        throw new Error(result.error || 'Failed to create session');
      }
    } catch (error: any) {
      console.error('Error starting session:', error);
      toast({
        title: "Erro ao Iniciar Sessão",
        description: error.message || "Não foi possível iniciar a sessão clínica.",
        variant: "destructive"
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [toast]);

  const updateSessionData = useCallback(async (updates: Partial<ClinicalSession>) => {
    if (!state.activeSession) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await ClinicalSessionService.updateClinicalSession(
        state.activeSession.id,
        updates
      );

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          activeSession: result.data!,
          isLoading: false
        }));
      } else {
        throw new Error(result.error || 'Failed to update session');
      }
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        title: "Erro ao Atualizar Sessão",
        description: error.message || "Não foi possível atualizar os dados da sessão.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.activeSession, toast]);

  const completeSession = useCallback(async () => {
    if (!state.activeSession) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await ClinicalSessionService.updateClinicalSession(
        state.activeSession.id,
        { status: 'completed' }
      );

      if (result.success) {
        toast({
          title: "Sessão Finalizada",
          description: "Sessão clínica finalizada com sucesso!",
        });

        // Clear localStorage and reset workflow
        localStorage.removeItem('activeSessionId');
        resetWorkflow();
      } else {
        throw new Error(result.error || 'Failed to complete session');
      }
    } catch (error: any) {
      console.error('Error completing session:', error);
      toast({
        title: "Erro ao Finalizar Sessão",
        description: error.message || "Não foi possível finalizar a sessão.",
        variant: "destructive"
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.activeSession, toast]);

  // Navigation methods with aliases for backward compatibility
  const setCurrentStep = useCallback((step: ClinicalWorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep);
    if (currentIndex < WORKFLOW_STEPS.length - 1) {
      setState(prev => ({ 
        ...prev, 
        currentStep: WORKFLOW_STEPS[currentIndex + 1] 
      }));
    }
  }, [state.currentStep]);

  const previousStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setState(prev => ({ 
        ...prev, 
        currentStep: WORKFLOW_STEPS[currentIndex - 1] 
      }));
    }
  }, [state.currentStep]);

  // Aliases for backward compatibility
  const goToNextStep = nextStep;
  const goToPreviousStep = previousStep;

  const resetWorkflow = useCallback(() => {
    localStorage.removeItem('activeSessionId');
    setState({
      currentStep: 'patient-selection',
      activePatient: null,
      activeSession: null,
      isLoading: false,
      hasPrefilledData: false
    });
  }, []);

  const contextValue: ClinicalWorkflowContextType = {
    state,
    setActivePatient,
    startSession,
    updateSessionData,
    completeSession,
    setCurrentStep,
    nextStep,
    previousStep,
    goToNextStep,
    goToPreviousStep,
    // Legacy properties for backward compatibility
    currentStep: state.currentStep,
    activeSession: state.activeSession,
    activePatient: state.activePatient,
    resetWorkflow
  };

  return (
    <ClinicalWorkflowContext.Provider value={contextValue}>
      {children}
    </ClinicalWorkflowContext.Provider>
  );
};

export const useClinicalWorkflow = () => {
  const context = useContext(ClinicalWorkflowContext);
  if (!context) {
    throw new Error('useClinicalWorkflow must be used within a ClinicalWorkflowProvider');
  }
  return context;
};
