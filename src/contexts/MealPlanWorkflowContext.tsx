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
  calculationData: any | null;
  setCalculationData: (data: any) => void;
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
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('patient');
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [calculationData, setCalculationData] = useState<any | null>(null);
  const [generationParams, setGenerationParams] = useState<MealPlanGenerationParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { activePatient } = usePatient();

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
        setMealPlan(result.data);
        setCurrentStep('display');
      } else {
        setError(result.error || 'Erro ao gerar plano alimentar');
        console.error("Erro ao gerar plano:", result.error);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado ao gerar plano';
      setError(errorMessage);
      console.error("Erro ao gerar plano:", error);
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
    setCurrentStep('patient');
    setIsSaving(false);
    setIsGenerating(false);
    setMealPlan(null);
    setPatient(null);
    setCalculationData(null);
    setGenerationParams(null);
    setError(null);
  }, []);

  useEffect(() => {
    resetWorkflow();
  }, [activePatient, resetWorkflow]);

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
