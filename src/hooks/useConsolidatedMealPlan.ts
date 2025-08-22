import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateMealPlanPDF } from '@/utils/pdfExport';
import { 
  ConsolidatedMealPlan, 
  MealPlanExportOptions,
  PDFMealPlanData 
} from '@/types';

interface UseConsolidatedMealPlanReturn {
  isExporting: boolean;
  handleExportPDF: (data: PDFMealPlanData) => void;
}

export const useConsolidatedMealPlan = (): UseConsolidatedMealPlanReturn => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportMealPlanToPDF = useCallback((options: MealPlanExportOptions) => {
    setIsExporting(true);
    try {
      const doc = generateMealPlanPDF(options);
      
      // Open PDF in a new tab for printing
      window.open(URL.createObjectURL(doc.output('blob')));
      
      toast({
        title: "PDF gerado",
        description: "O plano alimentar foi aberto em uma nova aba para impressão"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [toast]);

    const handleExportPDF = useCallback((data: PDFMealPlanData) => {
      const exportOptions: MealPlanExportOptions = {
        patientName: data.patient_name || data.patientName || 'Paciente',
        totalCalories: data.total_calories || data.totalCalories || 0,
        totalProtein: data.total_protein || data.totalProtein || 0,
        totalCarbs: data.total_carbs || data.totalCarbs || 0,
        totalFats: data.total_fats || data.totalFats || 0
      };
      
      return exportMealPlanToPDF(exportOptions);
    }, []);

  return {
    isExporting,
    handleExportPDF,
  };
};
