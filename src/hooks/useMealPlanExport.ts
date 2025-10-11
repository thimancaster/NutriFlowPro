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
    try {
      // Calculate totals from items
      const calculateRefTotals = (ref: Refeicao) => {
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

      // Transform refeicoes to PDF format
      const meals = params.refeicoes.map(ref => {
        const refTotals = calculateRefTotals(ref);
        return {
          name: ref.nome,
          calories: refTotals.kcal,
          protein: refTotals.ptn,
          carbs: refTotals.cho,
          fat: refTotals.lip,
          percent: totalCalories > 0 ? (refTotals.kcal / totalCalories) * 100 : 0,
          suggestions: ref.itens.map(item => 
            `${item.quantidade}x ${item.medida_utilizada} de ${item.alimento_nome} (${Math.round(item.kcal_calculado)}kcal)`
          )
        };
      });

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

      const doc = generateMealPlanPDF(exportOptions);
      doc.save(`Plano_Alimentar_${params.patientName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: '✅ PDF gerado com sucesso!',
        description: 'O plano alimentar foi exportado para PDF.',
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      toast({
        title: '❌ Erro ao gerar PDF',
        description: 'Não foi possível exportar o plano alimentar.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return { exportToPDF };
};
