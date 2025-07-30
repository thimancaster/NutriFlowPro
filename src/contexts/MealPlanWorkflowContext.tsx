
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Patient, ConsultationData } from '@/types';
import { MealPlan, MacroTargets } from '@/types/mealPlan';
import { MealPlanServiceV2 } from '@/services/mealPlan/MealPlanServiceV2';
import { useToast } from '@/hooks/use-toast';

interface MealPlanWorkflowState {
  // Patient and calculation data
  patient: Patient | null;
  calculationData: ConsultationData | null;
  
  // Meal plan state
  currentMealPlan: MealPlan | null;
  isGenerating: boolean;
  isSaving: boolean;
  
  // Workflow state
  currentStep: 'calculation' | 'generation' | 'editing' | 'completed';
  
  // Actions
  setPatient: (patient: Patient | null) => void;
  setCalculationData: (data: ConsultationData | null) => void;
  generateMealPlan: (userId: string) => Promise<void>;
  saveMealPlan: (updates: Partial<MealPlan>) => Promise<void>;
  setCurrentStep: (step: 'calculation' | 'generation' | 'editing' | 'completed') => void;
  resetWorkflow: () => void;
}

const MealPlanWorkflowContext = createContext<MealPlanWorkflowState | undefined>(undefined);

export const useMealPlanWorkflow = () => {
  const context = useContext(MealPlanWorkflowContext);
  if (!context) {
    throw new Error('useMealPlanWorkflow must be used within a MealPlanWorkflowProvider');
  }
  return context;
};

interface MealPlanWorkflowProviderProps {
  children: React.ReactNode;
}

export const MealPlanWorkflowProvider: React.FC<MealPlanWorkflowProviderProps> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [calculationData, setCalculationData] = useState<ConsultationData | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<'calculation' | 'generation' | 'editing' | 'completed'>('calculation');
  
  const { toast } = useToast();

  const generateMealPlan = useCallback(async (userId: string) => {
    if (!patient || !calculationData) {
      toast({
        title: 'Erro',
        description: 'Paciente e dados de cálculo são necessários',
        variant: 'destructive'
      });
      return;
    }

    console.log('Starting meal plan generation with:', { patient, calculationData });
    setIsGenerating(true);
    
    try {
      const targets: MacroTargets = {
        calories: calculationData.totalCalories || 2000,
        protein: calculationData.protein || 150,
        carbs: calculationData.carbs || 200,
        fats: calculationData.fats || 67
      };

      console.log('Generating meal plan with targets:', targets);

      const result = await MealPlanServiceV2.generateMealPlan({
        userId,
        patientId: patient.id,
        calculationId: calculationData.id,
        targets
      });

      if (result.success && result.data) {
        console.log('Meal plan generated successfully:', result.data);
        setCurrentMealPlan(result.data);
        setCurrentStep('editing');
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar gerado com sucesso!'
        });
      } else {
        console.error('Failed to generate meal plan:', result.error);
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao gerar plano alimentar',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao gerar plano alimentar',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [patient, calculationData, toast]);

  const saveMealPlan = useCallback(async (updates: Partial<MealPlan>) => {
    if (!currentMealPlan) {
      toast({
        title: 'Erro',
        description: 'Nenhum plano alimentar para salvar',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await MealPlanServiceV2.saveMealPlan({
        ...currentMealPlan,
        ...updates
      });

      if (result.success && result.data) {
        setCurrentMealPlan(result.data);
        setCurrentStep('completed');
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar salvo com sucesso!'
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao salvar plano alimentar',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar plano alimentar',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentMealPlan, toast]);

  const resetWorkflow = useCallback(() => {
    console.log('Resetting workflow');
    setPatient(null);
    setCalculationData(null);
    setCurrentMealPlan(null);
    setCurrentStep('calculation');
    setIsGenerating(false);
    setIsSaving(false);
  }, []);

  const value: MealPlanWorkflowState = {
    patient,
    calculationData,
    currentMealPlan,
    isGenerating,
    isSaving,
    currentStep,
    setPatient,
    setCalculationData,
    generateMealPlan,
    saveMealPlan,
    setCurrentStep,
    resetWorkflow
  };

  return (
    <MealPlanWorkflowContext.Provider value={value}>
      {children}
    </MealPlanWorkflowContext.Provider>
  );
};
