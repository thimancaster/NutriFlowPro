
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { usePatient } from '@/contexts/patient/PatientContext';
import { MealPlanServiceV3 } from '@/services/mealPlan/MealPlanServiceV3';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [calculationData, setCalculationData] = useState<CalculationData | null>(null);
  const [generationParams, setGenerationParams] = useState<MealPlanGenerationParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { activePatient } = usePatient();

  // Initialize calculation data from URL params or state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const createPlan = urlParams.get('createPlan');
    
    if (createPlan === 'true') {
      // Try to get calculation data from navigation state
      const state = (window.history.state?.usr) || {};
      if (state.calculationData) {
        console.log('[MEALPLAN:WORKFLOW] Inicializando com dados de cálculo:', state.calculationData);
        setCalculationData(state.calculationData);
        setCurrentStep('generation');
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateMealPlan = useCallback(async (nutritionalData: any) => {
    if (!activePatient?.id || !user?.id) {
      setError('Dados do paciente ou usuário não disponíveis');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('[MEALPLAN:WORKFLOW] Gerando plano com dados:', nutritionalData);
      
      const params: MealPlanGenerationParams = {
        userId: user.id,
        patientId: activePatient.id,
        totalCalories: nutritionalData.totalCalories,
        totalProtein: nutritionalData.protein,
        totalCarbs: nutritionalData.carbs,
        totalFats: nutritionalData.fats,
        date: new Date().toISOString().split('T')[0]
      };

      const result = await MealPlanServiceV3.generateMealPlan(params);

      if (result.success && result.data) {
        console.log('[MEALPLAN:WORKFLOW] ✅ Plano gerado:', result.data.id);
        setMealPlan(result.data);
        setCurrentStep('display');
      } else {
        setError(result.error || 'Erro ao gerar plano alimentar');
        console.error("[MEALPLAN:WORKFLOW] ❌ Erro ao gerar plano:", result.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao gerar plano';
      setError(errorMessage);
      console.error("[MEALPLAN:WORKFLOW] ❌ Erro ao gerar plano:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [activePatient, user]);

  const saveMealPlan = useCallback(async (updates: Partial<ConsolidatedMealPlan>) => {
    if (!mealPlan) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await MealPlanServiceV3.updateMealPlan(mealPlan.id, updates);
      if (result.success && result.data) {
        setMealPlan(result.data);
      } else {
        setError(result.error || 'Erro ao salvar plano');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao salvar plano';
      setError(errorMessage);
      console.error("Erro ao salvar plano:", error);
    } finally {
      setIsSaving(false);
    }
  }, [mealPlan]);

  const resetWorkflow = useCallback(() => {
    console.log('[MEALPLAN:WORKFLOW] Reset do workflow');
    setCurrentStep('generation');
    setIsSaving(false);
    setIsGenerating(false);
    setMealPlan(null);
    setPatient(null);
    setGenerationParams(null);
    setError(null);
    // Manter calculationData para permitir nova geração
  }, []);

  // Provide the context value
  const value: MealPlanWorkflowContextType = {
    currentStep,
    setCurrentStep,
    isSaving,
    setIsSaving,
    isGenerating,
    setIsGenerating,
    mealPlan,
    setMealPlan,
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
