import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useConsolidatedNutrition } from '@/hooks/useConsolidatedNutrition';
import { useMealPlanGeneration } from '@/hooks/useMealPlanGeneration';
import {
  ConsolidatedMealPlan,
  MealPlanGenerationParams,
} from '@/types/mealPlanTypes';

// Updated step types to match usage consistently
export type WorkflowStep = 'patient' | 'nutritional' | 'generation' | 'display' | 'editing' | 'review' | 'completed';

// Calculation data interface
interface CalculationData {
  id?: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  objective?: string;
  tmb?: number;
  get?: number;
  vet?: number;
  systemType?: string;
}

// Define the context type with all required properties
interface MealPlanWorkflowContextType {
  currentStep: WorkflowStep;
  setCurrentStep: (step: WorkflowStep) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  mealPlan: ConsolidatedMealPlan | null;
  setMealPlan: (plan: ConsolidatedMealPlan | null) => void;
  patient: any | null;
  setPatient: (patient: any) => void;
  calculationData: CalculationData | null;
  setCalculationData: (data: CalculationData | null) => void;
  currentMealPlan: ConsolidatedMealPlan | null;
  generationParams: MealPlanGenerationParams | null;
  setGenerationParams: (params: MealPlanGenerationParams | null) => void;
  error: string | null;
  clearError: () => void;
  generateMealPlan: (nutritionalData: any) => Promise<void>;
  saveMealPlan: (updates: Partial<ConsolidatedMealPlan>) => Promise<void>;
  resetWorkflow: () => void;
  autoCalculateNutrition: () => Promise<void>;
  calculationStatus: 'idle' | 'loading' | 'ready' | 'error';
}

// Create the context with a default value
const MealPlanWorkflowContext = createContext<MealPlanWorkflowContextType | undefined>(
  undefined
);

// Create a provider component
export const MealPlanWorkflowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('generation');
  const [isSaving, setIsSaving] = useState(false);
  const [patient, setPatient] = useState<any | null>(null);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [generationParams, setGenerationParams] = useState<MealPlanGenerationParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [calculationStatus, setCalculationStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const { user } = useAuth();
  const { activePatient } = usePatient();
  const { calculateNutrition, results, isCalculating } = useConsolidatedNutrition();
  const { isGenerating, mealPlan, generateMealPlan: generatePlan, clearMealPlan } = useMealPlanGeneration();

  // Initialize calculation data from URL params or state
  useEffect(() => {
    console.log('[WORKFLOW:PLAN] 🚀 Inicializando contexto do workflow');
    
    const urlParams = new URLSearchParams(window.location.search);
    const createPlan = urlParams.get('createPlan');
    
    if (createPlan === 'true') {
      // Try to get calculation data from navigation state
      const state = (window.history.state?.usr) || {};
      if (state.calculationData) {
        console.log('[WORKFLOW:PLAN] 📊 Dados de cálculo encontrados no state:', state.calculationData);
        setCalculationData(state.calculationData);
        setCalculationStatus('ready');
        setCurrentStep('generation');
      } else {
        console.log('[WORKFLOW:PLAN] ⚠️ Nenhum dado de cálculo no state, tentando auto-cálculo');
        setCalculationStatus('idle');
      }
    }
  }, []);

  const autoCalculateNutrition = useCallback(async () => {
    if (!activePatient) {
      console.log('[WORKFLOW:PLAN] ❌ Nenhum paciente ativo para auto-cálculo');
      setError('Selecione um paciente primeiro');
      setCalculationStatus('error');
      return;
    }

    if (!user?.id) {
      console.log('[WORKFLOW:PLAN] ❌ Usuário não autenticado');
      setError('Usuário não autenticado');
      setCalculationStatus('error');
      return;
    }

    console.log('[WORKFLOW:PLAN] 🧮 Iniciando auto-cálculo nutricional para:', activePatient.name);
    setCalculationStatus('loading');
    setError(null);

    try {
      // Get patient data for calculation
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 30; // default age if not available

      // Use default values if patient data is incomplete  
      const calculationParams = {
        id: activePatient.id,
        sex: (activePatient.gender as 'male' | 'female') || 'male',
        weight: activePatient.weight || 70, // default weight
        height: activePatient.height || 170, // default height
        age: patientAge,
        gender: (activePatient.gender === 'male' ? 'M' : 'F') as 'M' | 'F',
        activityLevel: activePatient.goals?.activityLevel || 'moderado' as any,
        objective: activePatient.goals?.objective || 'manutencao' as any,
        profile: activePatient.goals?.profile || 'eutrofico' as any
      };

      console.log('[WORKFLOW:PLAN] 📋 Parâmetros completos:', {
        hasId: !!calculationParams.id,
        weight: calculationParams.weight,
        height: calculationParams.height,
        age: calculationParams.age,
        allFields: Object.keys(calculationParams)
      });

      const result = await calculateNutrition(calculationParams);
      
      if (result) {
        console.log('[WORKFLOW:PLAN] ✅ Auto-cálculo concluído com sucesso');
      } else {
        throw new Error('Falha no cálculo nutricional');
      }
    } catch (error: any) {
      console.error('[WORKFLOW:PLAN] ❌ Erro no auto-cálculo:', error);
      setError(`Erro no cálculo: ${error.message || 'Erro desconhecido'}`);
      setCalculationStatus('error');
    }
  }, [activePatient, calculateNutrition, user?.id]);

  // Auto-calculate when patient is available but no calculation data exists
  useEffect(() => {
    if (activePatient && user?.id && calculationStatus === 'idle' && !calculationData && !isCalculating) {
      // Ensure we have basic patient data before calculating
      const hasBasicData = activePatient.id && activePatient.name;
      
      if (hasBasicData) {
        console.log('[WORKFLOW:PLAN] 🔄 Disparando auto-cálculo para paciente:', activePatient.name);
        autoCalculateNutrition();
      } else {
        console.log('[WORKFLOW:PLAN] ⚠️ Dados básicos do paciente insuficientes:', {
          id: activePatient.id,
          name: activePatient.name
        });
        setError('Dados básicos do paciente insuficientes');
        setCalculationStatus('error');
      }
    } else if (!user?.id && activePatient) {
      console.log('[WORKFLOW:PLAN] ⏳ Aguardando autenticação do usuário...');
    }
  }, [activePatient, user?.id, calculationStatus, calculationData, autoCalculateNutrition, isCalculating]);

  // Update calculation status based on consolidatedNutrition results
  useEffect(() => {
    if (isCalculating) {
      setCalculationStatus('loading');
    } else if (results) {
      console.log('[WORKFLOW:PLAN] ✅ Resultados de cálculo disponíveis:', {
        vet: results.vet,
        protein: results.macros.protein.grams,
        carbs: results.macros.carbs.grams,
        fats: results.macros.fat.grams
      });
      
      const newCalculationData: CalculationData = {
        id: `auto-calc-${Date.now()}`,
        totalCalories: results.vet,
        protein: results.macros.protein.grams,
        carbs: results.macros.carbs.grams,
        fats: results.macros.fat.grams,
        tmb: results.tmb.value,
        get: results.get,
        vet: results.vet,
        systemType: 'ENP'
      };
      
      setCalculationData(newCalculationData);
      setCalculationStatus('ready');
    }
  }, [isCalculating, results]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateMealPlan = useCallback(async (nutritionalData: any) => {
    if (!activePatient?.id || !user?.id) {
      setError('Dados do paciente ou usuário não disponíveis');
      return;
    }

    console.log('[WORKFLOW:PLAN] 🍽️ Gerando plano alimentar com dados:', nutritionalData);
    setError(null);
    
    try {
      const result = await generatePlan(
        {
          totalCalories: nutritionalData.totalCalories,
          protein: nutritionalData.protein,
          carbs: nutritionalData.carbs,
          fats: nutritionalData.fats
        },
        activePatient.id,
        user.id
      );

      if (result) {
        console.log('[WORKFLOW:PLAN] ✅ Plano gerado com sucesso:', result.id);
        setCurrentStep('display');
      } else {
        throw new Error('Erro ao gerar plano alimentar');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao gerar plano';
      setError(errorMessage);
      console.error("[WORKFLOW:PLAN] ❌ Erro ao gerar plano:", error);
    }
  }, [activePatient, user, generatePlan]);

  const saveMealPlan = useCallback(async (updates: Partial<ConsolidatedMealPlan>) => {
    if (!mealPlan) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Simular salvamento
      console.log('[WORKFLOW:PLAN] 💾 Salvando plano alimentar:', updates);
      // Em uma implementação real, aqui faria a chamada para a API/Supabase
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao salvar plano';
      setError(errorMessage);
      console.error("Erro ao salvar plano:", error);
    } finally {
      setIsSaving(false);
    }
  }, [mealPlan]);

  const resetWorkflow = useCallback(() => {
    console.log('[WORKFLOW:PLAN] 🔄 Reset do workflow');
    setCurrentStep('generation');
    setIsSaving(false);
    setPatient(null);
    setGenerationParams(null);
    setError(null);
    setCalculationStatus('idle');
    clearMealPlan();
    // Manter calculationData para permitir nova geração
  }, [clearMealPlan]);

  // Provide the context value
  const value: MealPlanWorkflowContextType = {
    currentStep,
    setCurrentStep,
    isSaving,
    setIsSaving,
    isGenerating,
    setIsGenerating: () => {}, // Controlado pelo hook
    mealPlan,
    setMealPlan: () => {}, // Controlado pelo hook
    patient,
    setPatient,
    calculationData,
    setCalculationData,
    currentMealPlan: mealPlan,
    generationParams,
    setGenerationParams,
    error,
    clearError,
    generateMealPlan,
    saveMealPlan,
    resetWorkflow,
    autoCalculateNutrition,
    calculationStatus,
  };

  return (
    <MealPlanWorkflowContext.Provider value={value}>
      {children}
    </MealPlanWorkflowContext.Provider>
  );
};

// Create a custom hook to use the context
export const useMealPlanWorkflow = () => {
  const context = useContext(MealPlanWorkflowContext);
  if (!context) {
    throw new Error(
      'useMealPlanWorkflow must be used within a MealPlanWorkflowProvider'
    );
  }
  return context;
};