import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  CalculationResult,
} from '@/utils/nutrition/official/officialCalculations';
import { MealPlan } from '@/types/mealPlan';
import { useClinicalWorkflow } from './ClinicalWorkflowContext'; // Usaremos para pegar a sessão ativa

// Define a estrutura de dados (o "estado") do nosso contexto unificado
interface UnifiedNutritionState {
  nutritionalCalculations: CalculationResult | null;
  mealPlan: MealPlan | null;
  isLoading: boolean;
  error: string | null;
}

// Define as funções que nosso contexto irá fornecer para os componentes
interface UnifiedNutritionContextType extends UnifiedNutritionState {
  setNutritionalCalculations: (results: CalculationResult | null) => void;
  setMealPlan: (plan: MealPlan | null) => void;
  saveWorkflowStateToSupabase: () => Promise<void>;
  loadWorkflowStateFromSupabase: () => Promise<void>;
  resetWorkflow: () => void;
}

// Cria o contexto com um valor inicial nulo
export const UnifiedNutritionContext = createContext<
  UnifiedNutritionContextType | undefined
>(undefined);

// Cria o Provedor, que é o componente que vai gerenciar e fornecer o estado
export const UnifiedNutritionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { activeSession, updateSession } = useClinicalWorkflow();

  const [state, setState] = useState<UnifiedNutritionState>({
    nutritionalCalculations: null,
    mealPlan: null,
    isLoading: false,
    error: null,
  });

  // Funções para manipular o estado
  const setNutritionalCalculations = (results: CalculationResult | null) => {
    setState((prevState) => ({ ...prevState, nutritionalCalculations: results }));
  };

  const setMealPlan = (plan: MealPlan | null) => {
    setState((prevState) => ({ ...prevState, mealPlan: plan }));
  };

  const resetWorkflow = () => {
    setState({
      nutritionalCalculations: null,
      mealPlan: null,
      isLoading: false,
      error: null,
    });
  };

  // Função para salvar o estado atual no Supabase através do ClinicalWorkflowContext
  const saveWorkflowStateToSupabase = async () => {
    if (!activeSession) {
      console.error('Nenhuma sessão clínica ativa para salvar.');
      setState(prev => ({ ...prev, error: 'Nenhuma sessão clínica ativa para salvar.' }));
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      await updateSession({
        nutritional_results: state.nutritionalCalculations,
        meal_plan_draft: state.mealPlan,
      });
      console.log('Estado do workflow salvo com sucesso no Supabase.');
    } catch (error) {
      console.error('Erro ao salvar estado do workflow:', error);
      setState(prev => ({ ...prev, error: 'Falha ao salvar o progresso.' }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };
  
  // Função para carregar o estado do Supabase quando uma sessão é ativada
  const loadWorkflowStateFromSupabase = async () => {
    if (activeSession) {
        setState({
            nutritionalCalculations: activeSession.nutritional_results || null,
            mealPlan: activeSession.meal_plan_draft || null,
            isLoading: false,
            error: null,
        });
    }
  };


  // Monta o valor que será fornecido pelo contexto
  const contextValue: UnifiedNutritionContextType = {
    ...state,
    setNutritionalCalculations,
    setMealPlan,
    saveWorkflowStateToSupabase,
    loadWorkflowStateFromSupabase,
    resetWorkflow,
  };

  return (
    <UnifiedNutritionContext.Provider value={contextValue}>
      {children}
    </UnifiedNutritionContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto nos componentes
export const useUnifiedNutrition = () => {
  const context = useContext(UnifiedNutritionContext);
  if (context === undefined) {
    throw new Error(
      'useUnifiedNutrition deve ser usado dentro de um UnifiedNutritionProvider'
    );
  }
  return context;
};
