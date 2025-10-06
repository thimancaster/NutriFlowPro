import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useOfficialCalculations } from '@/hooks/useOfficialCalculations';
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
  const { calculate: calculateOfficial, results: officialResults, loading: isOfficialCalculating } = useOfficialCalculations();
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

      // Use official calculation system
      const { calculateComplete_Official } = await import('@/utils/nutrition/official/officialCalculations');
      
      const result = await calculateComplete_Official({
        weight: activePatient.weight || 70,
        height: activePatient.height || 170,
        age: patientAge,
        gender: (activePatient.gender === 'male' ? 'M' : activePatient.gender === 'female' ? 'F' : 'M') as 'M' | 'F',
        profile: (activePatient.goals?.profile || 'eutrofico') as any,
        activityLevel: (activePatient.goals?.activityLevel || 'moderado') as any,
        objective: (activePatient.goals?.objective || 'manutenção') as any,
        macroInputs: { proteinPerKg: 1.6, fatPerKg: 1.0 } // Default macro inputs
      });
      
      if (result) {
        console.log('[WORKFLOW:PLAN] ✅ Auto-cálculo concluído com sucesso');
        // The result will be handled by the useEffect watching officialResults
      } else {
        throw new Error('Falha no cálculo nutricional');
      }
    } catch (error: any) {
      console.error('[WORKFLOW:PLAN] ❌ Erro no auto-cálculo:', error);
      setError(`Erro no cálculo: ${error.message || 'Erro desconhecido'}`);
      setCalculationStatus('error');
    }
  }, [activePatient, user?.id]);

  // Auto-calculate when patient is available but no calculation data exists
  useEffect(() => {
    if (activePatient && user?.id && calculationStatus === 'idle' && !calculationData && !isOfficialCalculating) {
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
  }, [activePatient, user?.id, calculationStatus, calculationData, autoCalculateNutrition, isOfficialCalculating]);

  // Update calculation status based on official calculation results
  useEffect(() => {
    if (isOfficialCalculating) {
      setCalculationStatus('loading');
    } else if (officialResults) {
      console.log('[WORKFLOW:PLAN] ✅ Resultados de cálculo oficial disponíveis:', {
        vet: officialResults.vet,
        protein: officialResults.macros.protein.grams,
        carbs: officialResults.macros.carbs.grams,
        fats: officialResults.macros.fat.grams
      });
      
      const newCalculationData: CalculationData = {
        id: `official-calc-${Date.now()}`,
        totalCalories: officialResults.vet,
        protein: officialResults.macros.protein.grams,
        carbs: officialResults.macros.carbs.grams,
        fats: officialResults.macros.fat.grams,
        tmb: officialResults.tmb.value,
        get: officialResults.get,
        vet: officialResults.vet,
        systemType: 'OFFICIAL'
      };
      
      setCalculationData(newCalculationData);
      setCalculationStatus('ready');
    }
  }, [isOfficialCalculating, officialResults]);

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
      // Use the new orchestrated workflow
      const { PlanWorkflowService } = await import('@/services/workflow/planWorkflow');
      
      const result = await PlanWorkflowService.gerarPlanoAlimentar({
        patientData: {
          id: activePatient.id,
          name: activePatient.name,
          weight: activePatient.weight,
          height: activePatient.height,
          age: activePatient.birth_date 
            ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : undefined,
          gender: activePatient.gender === 'female' ? 'F' as const : 'M' as const,
          birth_date: activePatient.birth_date
        },
        calculationResults: calculationData ? {
          id: calculationData.id || `calc-${Date.now()}`,
          patient_id: activePatient.id,
          user_id: user.id,
          totalCalories: calculationData.totalCalories,
          protein: calculationData.protein,
          carbs: calculationData.carbs,
          fats: calculationData.fats,
          tmb: calculationData.tmb || calculationData.totalCalories * 0.7,
          get: calculationData.get || calculationData.totalCalories * 0.85,
          vet: calculationData.vet || calculationData.totalCalories,
          objective: calculationData.objective || 'manutencao',
          status: 'concluida'
        } : undefined,
        userId: user.id
      });

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
  }, [activePatient, user, calculationData]);

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