/**
 * HOOK DE GERAÇÃO DE PLANO ALIMENTAR
 * 
 * Responsabilidade: Apenas orquestrar a chamada ao AutoGenerationService
 * e fornecer feedback ao usuário. NENHUMA lógica de escolha de alimentos aqui.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutoGenerationService, PatientProfile } from '@/services/mealPlan/AutoGenerationService';
import { Refeicao } from '@/hooks/useMealPlanCalculations';
import { useConsultationData } from '@/contexts/ConsultationDataContext';
import { usePatient } from '@/contexts/patient/PatientContext';

export const useMealPlanGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { consultationData } = useConsultationData();
  const { activePatient } = usePatient();

  const generateMealPlan = useCallback(async (
    currentRefeicoes: Refeicao[],
    _patientId?: string // Mantido para compatibilidade, mas não usado
  ): Promise<Refeicao[]> => {
    
    console.log('[HOOK] Iniciando geração de plano alimentar...');
    setIsGenerating(true);
    
    try {
      // Extrai metadados do paciente/consulta para alimentar o motor
      const profile: PatientProfile = {
        objective: extractObjective(),
        restrictions: extractRestrictions(),
        gender: activePatient?.gender || 'male'
      };

      console.log('[HOOK] Perfil extraído:', profile);

      // CHAMADA ÚNICA AO MOTOR
      const newPlan = await AutoGenerationService.generatePlan(currentRefeicoes, profile);
      
      // Feedback para o usuário
      const totalItens = newPlan.reduce((acc, r) => acc + r.itens.length, 0);
      const mealsWithItems = newPlan.filter(r => r.itens.length > 0).length;

      if (totalItens === 0) {
        toast({
          title: "Não foi possível gerar",
          description: "Não encontramos alimentos compatíveis com as restrições e metas. Verifique se o banco de alimentos está populado.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sugestão Gerada!",
          description: `${totalItens} alimentos selecionados em ${mealsWithItems} refeições.`,
          variant: "default"
        });
      }

      return newPlan;

    } catch (error) {
      console.error('[HOOK] Erro fatal na geração:', error);
      toast({
        title: "Erro no Sistema",
        description: "Falha ao comunicar com o motor de geração.",
        variant: "destructive"
      });
      return currentRefeicoes;
    } finally {
      setIsGenerating(false);
    }
  }, [consultationData, activePatient, toast]);

  // --- Helpers para extrair dados do contexto ---

  const extractObjective = (): string => {
    // Prioridade 1: Campo direto do consultationData
    if (consultationData?.objective) {
      return consultationData.objective;
    }
    
    // Prioridade 2: Campo goal do consultationData
    if (consultationData?.goal) {
      return consultationData.goal;
    }
    
    // Prioridade 3: Tentar extrair dos goals do paciente
    const goals = activePatient?.goals;
    if (goals && typeof goals === 'object') {
      if ('objective' in goals && goals.objective) return String(goals.objective);
      
      // Inferir objetivo pelo goal de peso
      if ('weight' in goals && goals.weight) {
        const currentWeight = activePatient?.weight;
        if (currentWeight && typeof goals.weight === 'number') {
          if (goals.weight > currentWeight) return 'ganho_massa';
          if (goals.weight < currentWeight) return 'emagrecimento';
        }
      }
    }
    
    return 'manutencao';
  };

  const extractRestrictions = (): string[] => {
    const restrictions: string[] = [];
    
    // Tentar extrair dos goals do paciente
    const goals = activePatient?.goals;
    if (goals && typeof goals === 'object' && 'restrictions' in goals) {
      const patientRestrictions = goals.restrictions;
      if (Array.isArray(patientRestrictions)) {
        restrictions.push(...patientRestrictions);
      } else if (typeof patientRestrictions === 'string') {
        restrictions.push(patientRestrictions);
      }
    }
    
    return [...new Set(restrictions)]; // Remove duplicatas
  };

  return {
    isGenerating,
    generateMealPlan
  };
};
