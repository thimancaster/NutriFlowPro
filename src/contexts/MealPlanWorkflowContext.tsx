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
  error: string | null;
  
  // Workflow state
  currentStep: 'calculation' | 'generation' | 'editing' | 'completed';
  
  // Actions
  setPatient: (patient: Patient | null) => void;
  setCalculationData: (data: ConsultationData | null) => void;
  generateMealPlan: (userId: string) => Promise<void>;
  saveMealPlan: (updates: Partial<MealPlan>) => Promise<void>;
  setCurrentStep: (step: 'calculation' | 'generation' | 'editing' | 'completed') => void;
  resetWorkflow: () => void;
  clearError: () => void;
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
  const [patient, setPatientState] = useState<Patient | null>(null);
  const [calculationData, setCalculationDataState] = useState<ConsultationData | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStepState] = useState<'calculation' | 'generation' | 'editing' | 'completed'>('calculation');
  
  const { toast } = useToast();

  const setPatient = useCallback((newPatient: Patient | null) => {
    console.log('🔄 Atualizando paciente:', newPatient?.name || 'null');
    setPatientState(newPatient);
  }, []);

  const setCalculationData = useCallback((newData: ConsultationData | null) => {
    console.log('🔄 Atualizando dados de cálculo:', newData ? 'presente' : 'null');
    setCalculationDataState(newData);
  }, []);

  const setCurrentStep = useCallback((step: 'calculation' | 'generation' | 'editing' | 'completed') => {
    console.log('🔄 Mudando etapa:', step);
    setCurrentStepState(step);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateMealPlan = useCallback(async (userId: string) => {
    if (!patient || !calculationData) {
      const errorMsg = 'Paciente e dados de cálculo são necessários';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
      return;
    }

    console.log('🚀 Iniciando geração do plano alimentar:', {
      patient: patient.name,
      calories: calculationData.totalCalories
    });

    // Limpar erros anteriores
    setError(null);
    setIsGenerating(true);
    setCurrentStepState('generation');
    
    try {
      const targets: MacroTargets = {
        calories: calculationData.totalCalories || 2000,
        protein: calculationData.protein || 150,
        carbs: calculationData.carbs || 200,
        fats: calculationData.fats || 67
      };

      console.log('📊 Metas nutricionais:', targets);

      const result = await MealPlanServiceV2.generateMealPlan({
        userId,
        patientId: patient.id,
        targets
      });

      if (result.success && result.data) {
        console.log('✅ Plano gerado com sucesso:', result.data.id);
        setCurrentMealPlan(result.data);
        setCurrentStepState('editing');
        
        toast({
          title: 'Sucesso! 🇧🇷',
          description: 'Plano alimentar brasileiro gerado com inteligência cultural!',
        });
      } else {
        console.error('❌ Falha na geração:', result.error);
        const errorMsg = result.error || 'Erro ao gerar plano alimentar';
        setError(errorMsg);
        setCurrentStepState('generation'); // Permanecer na geração para retry
        
        toast({
          title: 'Erro na Geração',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Erro inesperado na geração:', error);
      const errorMsg = 'Erro inesperado ao gerar plano alimentar';
      setError(errorMsg);
      setCurrentStepState('generation');
      
      toast({
        title: 'Erro Inesperado',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [patient, calculationData, toast]);

  const saveMealPlan = useCallback(async (updates: Partial<MealPlan>) => {
    if (!currentMealPlan) {
      const errorMsg = 'Nenhum plano alimentar para salvar';
      setError(errorMsg);
      toast({
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive'
      });
      return;
    }

    console.log('💾 Salvando plano alimentar:', currentMealPlan.id);
    setIsSaving(true);
    setError(null);
    
    try {
      const result = await MealPlanServiceV2.saveMealPlan({
        ...currentMealPlan,
        ...updates
      });

      if (result.success && result.data) {
        console.log('✅ Plano salvo com sucesso');
        setCurrentMealPlan(result.data);
        setCurrentStepState('completed');
        
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar salvo com sucesso!'
        });
      } else {
        console.error('❌ Erro ao salvar:', result.error);
        const errorMsg = result.error || 'Erro ao salvar plano alimentar';
        setError(errorMsg);
        
        toast({
          title: 'Erro',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('❌ Erro inesperado ao salvar:', error);
      const errorMsg = 'Erro inesperado ao salvar plano alimentar';
      setError(errorMsg);
      
      toast({
        title: 'Erro Inesperado',
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentMealPlan, toast]);

  const resetWorkflow = useCallback(() => {
    console.log('🔄 Resetando workflow');
    setPatientState(null);
    setCalculationDataState(null);
    setCurrentMealPlan(null);
    setCurrentStepState('calculation');
    setIsGenerating(false);
    setIsSaving(false);
    setError(null);
  }, []);

  const value: MealPlanWorkflowState = {
    patient,
    calculationData,
    currentMealPlan,
    isGenerating,
    isSaving,
    error,
    currentStep,
    setPatient,
    setCalculationData,
    generateMealPlan,
    saveMealPlan,
    setCurrentStep,
    resetWorkflow,
    clearError
  };

  return (
    <MealPlanWorkflowContext.Provider value={value}>
      {children}
    </MealPlanWorkflowContext.Provider>
  );
};
