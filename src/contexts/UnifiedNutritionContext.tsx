/**
 * UNIFIED NUTRITION CONTEXT
 * Contexto unificado para gerenciar o estado do plano alimentar
 * 
 * FASE 2 - SPRINT U1: Centralização de Estado
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ConsolidatedMealPlan } from '@/types/mealPlanTypes';
import { CalculationResult } from '@/utils/nutrition/official/officialCalculations';
import { useToast } from '@/hooks/use-toast';
import { MealPlanOrchestrator } from '@/services/mealPlan/MealPlanOrchestrator';

interface PatientData {
  id: string;
  name: string;
}

interface UnifiedNutritionState {
  // Estado do plano alimentar
  currentPlan: ConsolidatedMealPlan | null;
  calculationResults: CalculationResult | null;
  activePatientData: PatientData | null;
  
  // Estados de loading
  isLoading: boolean;
  isSaving: boolean;
  
  // Ações
  setCurrentPlan: (plan: ConsolidatedMealPlan | null) => void;
  setCalculationResults: (results: CalculationResult | null) => void;
  setActivePatientData: (patient: PatientData | null) => void;
  updatePlan: (updatedPlan: ConsolidatedMealPlan) => void;
  savePlan: (options?: SaveOptions) => Promise<string | null>;
  resetPlan: () => void;
  initializeSession: (patient: PatientData, calculations: CalculationResult) => void;
}

interface SaveOptions {
  skipNotification?: boolean;
}

const UnifiedNutritionContext = createContext<UnifiedNutritionState | undefined>(undefined);

export const UnifiedNutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  const [currentPlan, setCurrentPlanState] = useState<ConsolidatedMealPlan | null>(null);
  const [calculationResults, setCalculationResultsState] = useState<CalculationResult | null>(null);
  const [activePatientData, setActivePatientDataState] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const setCurrentPlan = useCallback((plan: ConsolidatedMealPlan | null) => {
    setCurrentPlanState(plan);
  }, []);

  const setCalculationResults = useCallback((results: CalculationResult | null) => {
    setCalculationResultsState(results);
  }, []);

  const setActivePatientData = useCallback((patient: PatientData | null) => {
    setActivePatientDataState(patient);
  }, []);

  const updatePlan = useCallback((updatedPlan: ConsolidatedMealPlan) => {
    setCurrentPlanState(updatedPlan);
  }, []);

  const savePlan = useCallback(async (options?: SaveOptions): Promise<string | null> => {
    if (!currentPlan) {
      toast({
        title: 'Erro',
        description: 'Nenhum plano para salvar',
        variant: 'destructive'
      });
      return null;
    }

    setIsSaving(true);
    try {
      const planId = await MealPlanOrchestrator.saveMealPlan(currentPlan, {
        createVersion: true
      });

      if (!options?.skipNotification) {
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar salvo com sucesso!'
        });
      }

      // Atualizar o plano com o ID se for novo
      if (!currentPlan.id) {
        setCurrentPlanState({ ...currentPlan, id: planId });
      }

      return planId;
    } catch (error: any) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [currentPlan, toast]);

  const resetPlan = useCallback(() => {
    setCurrentPlanState(null);
    setCalculationResultsState(null);
    setActivePatientDataState(null);
  }, []);

  const initializeSession = useCallback((patient: PatientData, calculations: CalculationResult) => {
    setActivePatientDataState(patient);
    setCalculationResultsState(calculations);
    setCurrentPlanState(null);
  }, []);

  const value: UnifiedNutritionState = {
    currentPlan,
    calculationResults,
    activePatientData,
    isLoading,
    isSaving,
    setCurrentPlan,
    setCalculationResults,
    setActivePatientData,
    updatePlan,
    savePlan,
    resetPlan,
    initializeSession
  };

  return (
    <UnifiedNutritionContext.Provider value={value}>
      {children}
    </UnifiedNutritionContext.Provider>
  );
};

/**
 * Hook para consumir o UnifiedNutritionContext
 */
export const useUnifiedNutrition = (): UnifiedNutritionState => {
  const context = useContext(UnifiedNutritionContext);
  if (!context) {
    throw new Error('useUnifiedNutrition must be used within UnifiedNutritionProvider');
  }
  return context;
};
