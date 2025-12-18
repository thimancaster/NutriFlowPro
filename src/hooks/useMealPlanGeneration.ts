/**
 * HOOK DE GERAÇÃO DE PLANO ALIMENTAR
 * 
 * Responsabilidade: Apenas preparar o perfil do paciente e chamar o motor.
 * NENHUMA lógica de cálculo ou escolha de alimentos aqui.
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
    _patientId?: string
  ): Promise<Refeicao[]> => {
    console.log('[HOOK] Iniciando geração de plano alimentar...');
    setIsGenerating(true);
    
    try {
      // Monta perfil do paciente a partir dos contextos
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
          description: "Não encontramos alimentos compatíveis. Verifique se há alimentos cadastrados no banco.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Plano Gerado!",
          description: `${totalItens} alimentos em ${mealsWithItems} refeições.`,
        });
      }

      return newPlan;

    } catch (error) {
      console.error('[HOOK] Erro na geração:', error);
      toast({
        title: "Erro na Geração",
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
    if (consultationData?.objective) return consultationData.objective;
    if (consultationData?.goal) return consultationData.goal;
    
    const goals = activePatient?.goals;
    if (goals && typeof goals === 'object') {
      if ('objective' in goals && goals.objective) return String(goals.objective);
      
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
    
    const goals = activePatient?.goals;
    if (goals && typeof goals === 'object' && 'restrictions' in goals) {
      const patientRestrictions = goals.restrictions;
      if (Array.isArray(patientRestrictions)) {
        restrictions.push(...patientRestrictions);
      } else if (typeof patientRestrictions === 'string') {
        restrictions.push(patientRestrictions);
      }
    }
    
    return [...new Set(restrictions)];
  };

  return {
    isGenerating,
    generateMealPlan
  };
};
