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
import { MealPlanOrchestrator, AutoGenParams } from '@/services/mealPlan/MealPlanOrchestrator';
import { useAuth } from './auth/AuthContext';

interface PatientData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
}

interface UnifiedNutritionState {
  // Estado do plano alimentar
  currentPlan: ConsolidatedMealPlan | null;
  calculationResults: CalculationResult | null;
  activePatientData: PatientData | null;
  
  // Estados de loading
  isLoading: boolean;
  isSaving: boolean;
  isReadyForMealPlan: boolean;
  
  // Ações existentes
  setCurrentPlan: (plan: ConsolidatedMealPlan | null) => void;
  setCalculationResults: (results: CalculationResult | null) => void;
  setActivePatientData: (patient: PatientData | null) => void;
  updatePlan: (updatedPlan: ConsolidatedMealPlan) => void;
  savePlan: (options?: SaveOptions) => Promise<string | null>;
  resetPlan: () => void;
  initializeSession: (patient: PatientData, calculations: CalculationResult) => void;
  
  // FASE 2 - Novas ações de integração automática
  setCalculationAndPrepare: (results: CalculationResult, patient: PatientData) => void;
  generateAutomaticPlanFromContext: () => Promise<ConsolidatedMealPlan | null>;
  exportCurrentPlanToPDF: (options?: ExportPDFOptions) => Promise<void>;
}

interface ExportPDFOptions {
  nutritionistName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  notes?: string;
  autoDownload?: boolean;
}

interface SaveOptions {
  skipNotification?: boolean;
}

const UnifiedNutritionContext = createContext<UnifiedNutritionState | undefined>(undefined);

export const UnifiedNutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentPlan, setCurrentPlanState] = useState<ConsolidatedMealPlan | null>(null);
  const [calculationResults, setCalculationResultsState] = useState<CalculationResult | null>(null);
  const [activePatientData, setActivePatientDataState] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReadyForMealPlan, setIsReadyForMealPlan] = useState(false);

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
      const planId = await MealPlanOrchestrator.saveMealPlan(currentPlan);

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
    setIsReadyForMealPlan(false);
  }, []);

  /**
   * FASE 2 - Prepara o contexto para geração automática de plano
   */
  const setCalculationAndPrepare = useCallback((results: CalculationResult, patient: PatientData) => {
    console.log('🎯 UnifiedNutrition: Preparando para geração automática de plano...');
    setCalculationResultsState(results);
    setActivePatientDataState(patient);
    setIsReadyForMealPlan(true);
  }, []);

  /**
   * FASE 2 - Gera plano automático usando dados do contexto
   */
  const generateAutomaticPlanFromContext = useCallback(async (): Promise<ConsolidatedMealPlan | null> => {
    if (!calculationResults || !activePatientData || !user?.id) {
      toast({
        title: 'Dados Insuficientes',
        description: 'Complete o cálculo nutricional antes de gerar o plano',
        variant: 'destructive'
      });
      return null;
    }

    setIsLoading(true);
    try {
      console.log('🚀 UnifiedNutrition: Gerando plano automático...');

      const params: AutoGenParams = {
        userId: user.id,
        patientId: activePatientData.id,
        calculationResults,
        patientData: {
          name: activePatientData.name,
          age: activePatientData.age,
          gender: activePatientData.gender
        }
      };

      const plan = await MealPlanOrchestrator.generateAutomaticPlan(params);
      setCurrentPlanState(plan);
      setIsReadyForMealPlan(false);

      toast({
        title: 'Plano Gerado',
        description: 'Plano alimentar criado com sucesso!'
      });

      console.log('✅ UnifiedNutrition: Plano gerado e armazenado no contexto');
      return plan;

    } catch (error: any) {
      console.error('❌ UnifiedNutrition: Erro ao gerar plano', error);
      toast({
        title: 'Erro ao gerar plano',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [calculationResults, activePatientData, user?.id, toast]);

  /**
   * FASE 1 - Exporta plano atual para PDF
   */
  const exportCurrentPlanToPDF = useCallback(async (options?: ExportPDFOptions): Promise<void> => {
    if (!currentPlan || !activePatientData) {
      toast({
        title: 'Sem Plano',
        description: 'Gere um plano alimentar antes de exportar',
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('📄 UnifiedNutrition: Exportando plano para PDF...');

      await MealPlanOrchestrator.exportToPDF(currentPlan, {
        ...options,
        patientName: activePatientData.name,
        patientAge: activePatientData.age,
        patientGender: activePatientData.gender
      });

      toast({
        title: 'PDF Gerado',
        description: 'Plano alimentar exportado com sucesso!'
      });

    } catch (error: any) {
      console.error('❌ UnifiedNutrition: Erro ao exportar PDF', error);
      toast({
        title: 'Erro ao exportar PDF',
        description: error.message || 'Erro desconhecido',
        variant: 'destructive'
      });
    }
  }, [currentPlan, activePatientData, toast]);

  const value: UnifiedNutritionState = {
    currentPlan,
    calculationResults,
    activePatientData,
    isLoading,
    isSaving,
    isReadyForMealPlan,
    setCurrentPlan,
    setCalculationResults,
    setActivePatientData,
    updatePlan,
    savePlan,
    resetPlan,
    initializeSession,
    setCalculationAndPrepare,
    generateAutomaticPlanFromContext,
    exportCurrentPlanToPDF
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
