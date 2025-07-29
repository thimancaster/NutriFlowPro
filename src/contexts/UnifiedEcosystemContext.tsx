
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Patient, ConsultationData } from '@/types';
import { MealPlan, MacroTargets } from '@/types/mealPlan';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { consultationService } from '@/services/consultationService';
import { MealPlanServiceV2 } from '@/services/mealPlan/MealPlanServiceV2';

// Estados do ecossistema unificado
interface UnifiedEcosystemState {
  // Dados do paciente
  activePatient: Patient | null;
  
  // Dados da consulta/cálculo
  calculationData: any | null;
  consultationData: ConsultationData | null;
  
  // Plano alimentar
  mealPlan: MealPlan | null;
  
  // Estados de controle
  currentStep: 'patient' | 'calculation' | 'clinical' | 'meal_plan' | 'completed';
  isLoading: boolean;
  error: string | null;
  
  // Persistência
  lastSaved: Date | null;
  autoSaveEnabled: boolean;
}

type EcosystemAction =
  | { type: 'SET_PATIENT'; payload: Patient | null }
  | { type: 'SET_CALCULATION_DATA'; payload: any }
  | { type: 'SET_CONSULTATION_DATA'; payload: ConsultationData | null }
  | { type: 'SET_MEAL_PLAN'; payload: MealPlan | null }
  | { type: 'SET_CURRENT_STEP'; payload: UnifiedEcosystemState['currentStep'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'RESET_ECOSYSTEM' };

const initialState: UnifiedEcosystemState = {
  activePatient: null,
  calculationData: null,
  consultationData: null,
  mealPlan: null,
  currentStep: 'patient',
  isLoading: false,
  error: null,
  lastSaved: null,
  autoSaveEnabled: true,
};

function ecosystemReducer(state: UnifiedEcosystemState, action: EcosystemAction): UnifiedEcosystemState {
  switch (action.type) {
    case 'SET_PATIENT':
      return { ...state, activePatient: action.payload };
    
    case 'SET_CALCULATION_DATA':
      return { ...state, calculationData: action.payload };
    
    case 'SET_CONSULTATION_DATA':
      return { ...state, consultationData: action.payload };
    
    case 'SET_MEAL_PLAN':
      return { ...state, mealPlan: action.payload };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    
    case 'RESET_ECOSYSTEM':
      return initialState;
    
    default:
      return state;
  }
}

const UnifiedEcosystemContext = createContext<{
  state: UnifiedEcosystemState;
  // Ações do paciente
  setActivePatient: (patient: Patient | null) => void;
  
  // Ações da calculadora
  setCalculationData: (data: any) => void;
  
  // Ações do fluxo clínico
  setConsultationData: (data: ConsultationData | null) => void;
  
  // Ações do plano alimentar
  generateMealPlan: () => Promise<void>;
  setMealPlan: (plan: MealPlan | null) => void;
  
  // Navegação do fluxo
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setCurrentStep: (step: UnifiedEcosystemState['currentStep']) => void;
  
  // Persistência
  saveCurrentState: () => Promise<void>;
  loadSavedState: () => void;
  
  // Utilitários
  resetEcosystem: () => void;
  validateForMealPlan: () => { isValid: boolean; issues: string[] };
} | undefined>(undefined);

export const UnifiedEcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(ecosystemReducer, initialState);
  const { user } = useAuth();
  const { toast } = useToast();

  // Persistência no localStorage
  const STORAGE_KEY = 'unified_ecosystem_state';

  const saveToStorage = useCallback((newState: UnifiedEcosystemState) => {
    try {
      const dataToSave = {
        activePatient: newState.activePatient,
        calculationData: newState.calculationData,
        consultationData: newState.consultationData,
        currentStep: newState.currentStep,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const loadSavedState = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);
        
        if (parsedData.activePatient) {
          dispatch({ type: 'SET_PATIENT', payload: parsedData.activePatient });
        }
        if (parsedData.calculationData) {
          dispatch({ type: 'SET_CALCULATION_DATA', payload: parsedData.calculationData });
        }
        if (parsedData.consultationData) {
          dispatch({ type: 'SET_CONSULTATION_DATA', payload: parsedData.consultationData });
        }
        if (parsedData.currentStep) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: parsedData.currentStep });
        }
        if (parsedData.lastSaved) {
          dispatch({ type: 'SET_LAST_SAVED', payload: new Date(parsedData.lastSaved) });
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Carregar estado salvo na inicialização
  useEffect(() => {
    loadSavedState();
  }, [loadSavedState]);

  // Auto-salvar quando houver mudanças
  useEffect(() => {
    if (state.autoSaveEnabled) {
      saveToStorage(state);
    }
  }, [state, saveToStorage]);

  // Ações do paciente
  const setActivePatient = useCallback((patient: Patient | null) => {
    dispatch({ type: 'SET_PATIENT', payload: patient });
    if (patient) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'calculation' });
    }
  }, []);

  // Ações da calculadora
  const setCalculationData = useCallback((data: any) => {
    dispatch({ type: 'SET_CALCULATION_DATA', payload: data });
    
    // Criar dados de consulta baseados no cálculo
    if (data && state.activePatient) {
      const consultationData: ConsultationData = {
        id: data.id || `calc-${Date.now()}`,
        patient_id: state.activePatient.id,
        weight: data.weight || 0,
        height: data.height || 0,
        age: data.age || 0,
        gender: data.sex || 'M',
        bmr: data.bmr || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fats: data.fats || 0,
        totalCalories: data.tdee || 0,
        activity_level: data.activityLevel || 'moderado',
        patient: {
          id: state.activePatient.id,
          name: state.activePatient.name,
        },
        results: {
          bmr: data.bmr || 0,
          get: data.tdee || 0,
          vet: data.tdee || 0,
          adjustment: 0,
          macros: {
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fats || 0,
          },
        },
      };
      
      dispatch({ type: 'SET_CONSULTATION_DATA', payload: consultationData });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'clinical' });
    }
  }, [state.activePatient]);

  // Ações do fluxo clínico
  const setConsultationData = useCallback((data: ConsultationData | null) => {
    dispatch({ type: 'SET_CONSULTATION_DATA', payload: data });
  }, []);

  // Validação para geração do plano alimentar
  const validateForMealPlan = useCallback(() => {
    const issues: string[] = [];
    
    if (!user?.id) {
      issues.push('Usuário não autenticado');
    }
    
    if (!state.activePatient) {
      issues.push('Nenhum paciente selecionado');
    }
    
    if (!state.consultationData?.results) {
      issues.push('Dados de consulta incompletos');
    }
    
    if (state.consultationData?.results && !state.consultationData.results.vet) {
      issues.push('Cálculo de VET inválido');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }, [user?.id, state.activePatient, state.consultationData]);

  // Geração do plano alimentar
  const generateMealPlan = useCallback(async () => {
    const validation = validateForMealPlan();
    
    if (!validation.isValid) {
      dispatch({ type: 'SET_ERROR', payload: validation.issues.join('. ') });
      toast({
        title: 'Erro de Validação',
        description: validation.issues.join('. '),
        variant: 'destructive',
      });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const targets: MacroTargets = {
        calories: state.consultationData!.results!.vet,
        protein: state.consultationData!.results!.macros.protein,
        carbs: state.consultationData!.results!.macros.carbs,
        fats: state.consultationData!.results!.macros.fat,
      };
      
      const result = await MealPlanServiceV2.generateMealPlan({
        userId: user!.id,
        patientId: state.activePatient!.id,
        calculationId: state.consultationData!.id,
        targets,
      });
      
      if (result.success && result.data) {
        dispatch({ type: 'SET_MEAL_PLAN', payload: result.data });
        dispatch({ type: 'SET_CURRENT_STEP', payload: 'meal_plan' });
        
        toast({
          title: 'Sucesso! 🇧🇷',
          description: 'Plano alimentar brasileiro gerado com inteligência cultural!',
        });
      } else {
        throw new Error(result.error || 'Falha ao gerar plano alimentar');
      }
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Erro na Geração',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [validateForMealPlan, state, user, toast]);

  const setMealPlan = useCallback((plan: MealPlan | null) => {
    dispatch({ type: 'SET_MEAL_PLAN', payload: plan });
  }, []);

  // Navegação do fluxo
  const goToNextStep = useCallback(() => {
    const stepOrder: UnifiedEcosystemState['currentStep'][] = [
      'patient', 'calculation', 'clinical', 'meal_plan', 'completed'
    ];
    
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const nextStep = stepOrder[currentIndex + 1];
    
    if (nextStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStep });
    }
  }, [state.currentStep]);

  const goToPreviousStep = useCallback(() => {
    const stepOrder: UnifiedEcosystemState['currentStep'][] = [
      'patient', 'calculation', 'clinical', 'meal_plan', 'completed'
    ];
    
    const currentIndex = stepOrder.indexOf(state.currentStep);
    const previousStep = stepOrder[currentIndex - 1];
    
    if (previousStep) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: previousStep });
    }
  }, [state.currentStep]);

  const setCurrentStep = useCallback((step: UnifiedEcosystemState['currentStep']) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  // Persistência
  const saveCurrentState = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Salvar consulta se existir
      if (state.consultationData && user?.id) {
        await consultationService.saveConsultation({
          ...state.consultationData,
          user_id: user.id,
        });
      }
      
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
      
      toast({
        title: 'Estado Salvo',
        description: 'Progresso salvo com sucesso!',
      });
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast({
        title: 'Erro ao Salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.consultationData, user?.id, toast]);

  // Utilitários
  const resetEcosystem = useCallback(() => {
    dispatch({ type: 'RESET_ECOSYSTEM' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const contextValue = {
    state,
    setActivePatient,
    setCalculationData,
    setConsultationData,
    generateMealPlan,
    setMealPlan,
    goToNextStep,
    goToPreviousStep,
    setCurrentStep,
    saveCurrentState,
    loadSavedState,
    resetEcosystem,
    validateForMealPlan,
  };

  return (
    <UnifiedEcosystemContext.Provider value={contextValue}>
      {children}
    </UnifiedEcosystemContext.Provider>
  );
};

export const useUnifiedEcosystem = () => {
  const context = useContext(UnifiedEcosystemContext);
  if (!context) {
    throw new Error('useUnifiedEcosystem must be used within a UnifiedEcosystemProvider');
  }
  return context;
};
