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

// Define the context type
interface MealPlanWorkflowContextType {
  currentStep: 'patient' | 'nutritional' | 'mealPlan' | 'completed';
  setCurrentStep: (step: 'patient' | 'nutritional' | 'mealPlan' | 'completed') => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  mealPlan: ConsolidatedMealPlan | null;
  setMealPlan: (plan: ConsolidatedMealPlan | null) => void;
  generateMealPlan: (nutritionalData: any) => Promise<void>;
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
  const [currentStep, setCurrentStep] = useState<
    'patient' | 'nutritional' | 'mealPlan' | 'completed'
  >('patient');
  const [isSaving, setIsSaving] = useState(false);
  const [mealPlan, setMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const { user } = useAuth();
  const { activePatient } = usePatient();

  const generateMealPlan = useCallback(async (nutritionalData: any) => {
    if (!activePatient?.id || !user?.id) return;

    setIsSaving(true);
    
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
        setCurrentStep('mealPlan');
      } else {
        console.error("Erro ao gerar plano:", result.error);
        // Lidar com o erro (ex: mostrar mensagem ao usuário)
      }
    } catch (error) {
      console.error("Erro ao gerar plano:", error);
      // Lidar com o erro
    } finally {
      setIsSaving(false);
    }
  }, [activePatient, user]);

  const resetWorkflow = useCallback(() => {
    setCurrentStep('patient');
    setIsSaving(false);
    setMealPlan(null);
  }, []);

  useEffect(() => {
    // Reset workflow when activePatient changes
    resetWorkflow();
  }, [activePatient, resetWorkflow]);

  // Provide the context value
  const value: MealPlanWorkflowContextType = {
    currentStep,
    setCurrentStep,
    isSaving,
    setIsSaving,
    mealPlan,
    setMealPlan,
    generateMealPlan,
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
