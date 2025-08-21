
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePatient } from '@/contexts/patient/PatientContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { MealPlanServiceV3 } from '@/services/mealPlan/MealPlanServiceV3';
import { 
  ConsolidatedMealPlan, 
  MealPlanGenerationParams,
  PDFMealPlanData
} from '@/types/mealPlanTypes';
import { generateMealPlanPDF } from '@/utils/pdfExport';

/**
 * Hook consolidado para geração e gerenciamento de planos alimentares
 * SUBSTITUI: useMealPlanGeneration, useMealPlanActions, etc.
 */
export const useConsolidatedMealPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<ConsolidatedMealPlan | null>(null);
  const [mealPlans, setMealPlans] = useState<ConsolidatedMealPlan[]>([]);

  const { toast } = useToast();
  const { activePatient } = usePatient();
  const { user } = useAuth();

  /**
   * Gerar plano alimentar
   */
  const generateMealPlan = useCallback(async (
    totalCalories: number,
    totalProtein: number,
    totalCarbs: number,
    totalFats: number,
    patientId?: string
  ) => {
    if (!user?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return null;
    }

    const targetPatientId = patientId || activePatient?.id;
    if (!targetPatientId) {
      toast({
        title: 'Erro',
        description: 'Selecione um paciente primeiro',
        variant: 'destructive'
      });
      return null;
    }

    setIsGenerating(true);

    try {
      console.log('🚀 [useConsolidatedMealPlan] Gerando plano:', {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        patientId: targetPatientId
      });

      const params: MealPlanGenerationParams = {
        userId: user.id,
        patientId: targetPatientId,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats
      };

      const result = await MealPlanServiceV3.generateMealPlan(params);

      if (result.success && result.data) {
        console.log('✅ [useConsolidatedMealPlan] Plano gerado:', result.data.id);
        setCurrentMealPlan(result.data);
        
        toast({
          title: 'Sucesso! 🇧🇷',
          description: 'Plano alimentar brasileiro gerado com inteligência cultural!',
        });

        return result.data;
      } else {
        throw new Error(result.error || 'Falha ao gerar plano alimentar');
      }

    } catch (error: any) {
      console.error('❌ [useConsolidatedMealPlan] Erro ao gerar:', error);
      
      toast({
        title: 'Erro na Geração',
        description: error.message || 'Erro inesperado ao gerar plano alimentar',
        variant: 'destructive'
      });

      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user, activePatient, toast]);

  /**
   * Carregar plano específico
   */
  const loadMealPlan = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const result = await MealPlanServiceV3.getMealPlanById(id);
      
      if (result.success && result.data) {
        setCurrentMealPlan(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Plano não encontrado');
      }
    } catch (error: any) {
      console.error('❌ [useConsolidatedMealPlan] Erro ao carregar:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar plano alimentar',
        variant: 'destructive'
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Listar planos do usuário/paciente
   */
  const loadMealPlans = useCallback(async (patientId?: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    
    try {
      const result = await MealPlanServiceV3.listMealPlans(user.id, patientId);
      
      if (result.success && result.data) {
        setMealPlans(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Erro ao carregar planos');
      }
    } catch (error: any) {
      console.error('❌ [useConsolidatedMealPlan] Erro ao listar:', error);
      
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar lista de planos',
        variant: 'destructive'
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  /**
   * Gerar PDF do plano atual
   */
  const generatePDF = useCallback(async (
    mealPlan?: ConsolidatedMealPlan,
    patientName?: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ) => {
    const planToUse = mealPlan || currentMealPlan;
    
    if (!planToUse) {
      toast({
        title: 'Erro',
        description: 'Nenhum plano alimentar disponível para gerar PDF',
        variant: 'destructive'
      });
      return null;
    }

    try {
      console.log('📄 [useConsolidatedMealPlan] Gerando PDF...');

      // Converter para formato PDF usando o serviço consolidado
      const pdfData: PDFMealPlanData = MealPlanServiceV3.convertToPDFFormat(
        planToUse,
        patientName || activePatient?.name || 'Paciente',
        patientAge,
        patientGender || (activePatient?.gender as 'male' | 'female')
      );

      // Gerar PDF usando a função existente
      const doc = generateMealPlanPDF(pdfData);

      console.log('✅ [useConsolidatedMealPlan] PDF gerado com sucesso');
      
      toast({
        title: 'PDF Gerado',
        description: 'Plano alimentar convertido para PDF com sucesso!',
      });

      return doc;

    } catch (error: any) {
      console.error('❌ [useConsolidatedMealPlan] Erro ao gerar PDF:', error);
      
      toast({
        title: 'Erro no PDF',
        description: error.message || 'Erro ao gerar PDF do plano alimentar',
        variant: 'destructive'
      });
      
      return null;
    }
  }, [currentMealPlan, activePatient, toast]);

  /**
   * Download PDF
   */
  const downloadPDF = useCallback(async (
    mealPlan?: ConsolidatedMealPlan,
    patientName?: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ) => {
    const doc = await generatePDF(mealPlan, patientName, patientAge, patientGender);
    
    if (doc) {
      const fileName = `Plano_Alimentar_${patientName || activePatient?.name || 'Paciente'}.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);
      
      toast({
        title: 'Download Concluído',
        description: 'PDF baixado com sucesso!',
      });
    }
  }, [generatePDF, activePatient, toast]);

  /**
   * Imprimir PDF
   */
  const printPDF = useCallback(async (
    mealPlan?: ConsolidatedMealPlan,
    patientName?: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ) => {
    const doc = await generatePDF(mealPlan, patientName, patientAge, patientGender);
    
    if (doc) {
      // Abrir em nova aba para impressão
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      toast({
        title: 'PDF Preparado',
        description: 'PDF aberto em nova aba para impressão',
      });
    }
  }, [generatePDF, toast]);

  /**
   * Limpar estado
   */
  const clearState = useCallback(() => {
    setCurrentMealPlan(null);
    setMealPlans([]);
  }, []);

  return {
    // Estado
    isGenerating,
    isLoading,
    currentMealPlan,
    mealPlans,
    
    // Ações principais
    generateMealPlan,
    loadMealPlan,
    loadMealPlans,
    
    // PDF
    generatePDF,
    downloadPDF,
    printPDF,
    
    // Utilitários
    setCurrentMealPlan,
    clearState
  };
};
