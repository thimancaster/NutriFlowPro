import { useCallback } from 'react';
import { generateMealPlanPDF } from '@/utils/pdf/pdfExport';
import { MealPlanExportOptions } from '@/utils/pdf/types';
import { Refeicao } from './useMealPlanCalculations';
import { useToast } from './use-toast';

interface ExportParams {
  refeicoes: Refeicao[];
  patientName: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  nutritionistName?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  notes?: string;
}

export const useMealPlanExport = () => {
  const { toast } = useToast();

  const exportToPDF = useCallback(async (params: ExportParams) => {
    console.log('[PDF_EXPORT] Starting PDF export with params:', {
      patientName: params.patientName,
      refeicoesCount: params.refeicoes?.length,
      hasRefeicoes: !!params.refeicoes,
    });

    // Validate required params
    if (!params.refeicoes || !Array.isArray(params.refeicoes)) {
      console.error('[PDF_EXPORT] ❌ Invalid refeicoes:', params.refeicoes);
      toast({
        title: '❌ Erro ao gerar PDF',
        description: 'Dados do plano alimentar inválidos ou não encontrados.',
        variant: 'destructive',
      });
      return false;
    }

    if (params.refeicoes.length === 0) {
      console.error('[PDF_EXPORT] ❌ Empty refeicoes array');
      toast({
        title: '❌ Erro ao gerar PDF',
        description: 'O plano alimentar não possui refeições. Adicione refeições antes de exportar.',
        variant: 'destructive',
      });
      return false;
    }

    if (!params.patientName) {
      console.error('[PDF_EXPORT] ❌ Missing patient name');
      toast({
        title: '❌ Erro ao gerar PDF',
        description: 'Nome do paciente não informado.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Calculate totals from items with validation
      const calculateRefTotals = (ref: Refeicao) => {
        if (!ref.itens || !Array.isArray(ref.itens)) {
          console.warn('[PDF_EXPORT] Refeição sem itens:', ref.nome);
          return { kcal: 0, ptn: 0, cho: 0, lip: 0 };
        }
        return ref.itens.reduce(
          (acc, item) => ({
            kcal: acc.kcal + (item.kcal_calculado || 0),
            ptn: acc.ptn + (item.ptn_g_calculado || 0),
            cho: acc.cho + (item.cho_g_calculado || 0),
            lip: acc.lip + (item.lip_g_calculado || 0)
          }),
          { kcal: 0, ptn: 0, cho: 0, lip: 0 }
        );
      };

      const dailyTotals = params.refeicoes.reduce(
        (acc, ref) => {
          const refTotals = calculateRefTotals(ref);
          return {
            kcal: acc.kcal + refTotals.kcal,
            ptn: acc.ptn + refTotals.ptn,
            cho: acc.cho + refTotals.cho,
            lip: acc.lip + refTotals.lip
          };
        },
        { kcal: 0, ptn: 0, cho: 0, lip: 0 }
      );

      const totalCalories = dailyTotals.kcal;
      console.log('[PDF_EXPORT] Daily totals calculated:', dailyTotals);

      // Transform refeicoes to PDF format
      const meals = params.refeicoes.map(ref => {
        const refTotals = calculateRefTotals(ref);
        return {
          name: ref.nome || 'Refeição',
          calories: refTotals.kcal,
          protein: refTotals.ptn,
          carbs: refTotals.cho,
          fat: refTotals.lip,
          percent: totalCalories > 0 ? (refTotals.kcal / totalCalories) * 100 : 0,
          suggestions: (ref.itens || []).map(item => 
            `${item.quantidade}x ${item.medida_utilizada || 'porção'} de ${item.alimento_nome || 'Alimento'} (${Math.round(item.kcal_calculado || 0)}kcal)`
          )
        };
      });

      console.log('[PDF_EXPORT] Meals prepared for PDF:', meals.length);

      const exportOptions: MealPlanExportOptions = {
        patientName: params.patientName,
        patientAge: params.patientAge,
        patientGender: params.patientGender,
        meals,
        totalCalories: dailyTotals.kcal,
        totalProtein: dailyTotals.ptn,
        totalCarbs: dailyTotals.cho,
        totalFats: dailyTotals.lip,
        nutritionistName: params.nutritionistName,
        clinicName: params.clinicName,
        clinicAddress: params.clinicAddress,
        clinicPhone: params.clinicPhone,
        date: new Date().toLocaleDateString('pt-BR'),
        notes: params.notes
      };

      console.log('[PDF_EXPORT] Generating PDF with options:', {
        patientName: exportOptions.patientName,
        mealsCount: exportOptions.meals.length,
        totalCalories: exportOptions.totalCalories
      });

      const doc = generateMealPlanPDF(exportOptions);
      const fileName = `Plano_Alimentar_${params.patientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      console.log('[PDF_EXPORT] ✅ PDF generated successfully:', fileName);

      toast({
        title: '✅ PDF gerado com sucesso!',
        description: 'O plano alimentar foi exportado para PDF.',
      });

      return true;
    } catch (error) {
      console.error('[PDF_EXPORT] ❌ Error generating PDF:', error);
      toast({
        title: '❌ Erro ao gerar PDF',
        description: error instanceof Error ? error.message : 'Não foi possível exportar o plano alimentar.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return { exportToPDF };
};
