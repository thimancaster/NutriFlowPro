
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
  generateMealPlan: (
    totalCalories: number,
    protein: number,
    carbs: number,
    fats: number,
    patientId: string
  ) => Promise<ConsolidatedMealPlan | null>;
  isGenerating: boolean;
  currentMealPlan: ConsolidatedMealPlan | null;
  downloadPDF: (
    mealPlan: ConsolidatedMealPlan,
    patientName: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ) => Promise<void>;
  printPDF: (
    mealPlan: ConsolidatedMealPlan,
    patientName: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ) => Promise<void>;
  clearState: () => void;
}

export const useConsolidatedMealPlan = (): UseConsolidatedMealPlanReturn => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<ConsolidatedMealPlan | null>(null);

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
      totalFats: data.total_fats || data.totalFats || 0,
      meals: data.meals || []
    };
    
    return exportMealPlanToPDF(exportOptions);
  }, [exportMealPlanToPDF]);

  const generateMealPlan = useCallback(async (
    totalCalories: number,
    protein: number,
    carbs: number,
    fats: number,
    patientId: string
  ): Promise<ConsolidatedMealPlan | null> => {
    setIsGenerating(true);
    try {
      // Mock implementation - replace with actual service call
      const mockMealPlan: ConsolidatedMealPlan = {
        id: `meal-plan-${Date.now()}`,
        patient_id: patientId,
        user_id: 'current-user',
        name: 'Plano Alimentar Personalizado',
        description: 'Plano gerado automaticamente',
        date: new Date().toISOString().split('T')[0],
        total_calories: totalCalories,
        total_protein: protein,
        total_carbs: carbs,
        total_fats: fats,
        meals: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: 'Plano gerado pelo sistema',
        targets: {
          calories: totalCalories,
          protein: protein,
          carbs: carbs,
          fats: fats
        }
      };

      setCurrentMealPlan(mockMealPlan);
      return mockMealPlan;
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o plano alimentar",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const downloadPDF = useCallback(async (
    mealPlan: ConsolidatedMealPlan,
    patientName: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ): Promise<void> => {
    const pdfData: PDFMealPlanData = {
      patient_name: patientName,
      patient_age: patientAge,
      patient_gender: patientGender,
      total_calories: mealPlan.total_calories,
      total_protein: mealPlan.total_protein,
      total_carbs: mealPlan.total_carbs,
      total_fats: mealPlan.total_fats,
      meals: mealPlan.meals.map(meal => ({
        id: meal.id,
        name: meal.name,
        time: meal.time || '',
        items: meal.items || [],
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats
      }))
    };
    
    handleExportPDF(pdfData);
  }, [handleExportPDF]);

  const printPDF = useCallback(async (
    mealPlan: ConsolidatedMealPlan,
    patientName: string,
    patientAge?: number,
    patientGender?: 'male' | 'female'
  ): Promise<void> => {
    await downloadPDF(mealPlan, patientName, patientAge, patientGender);
  }, [downloadPDF]);

  const clearState = useCallback(() => {
    setCurrentMealPlan(null);
    setIsGenerating(false);
    setIsExporting(false);
  }, []);

  return {
    isExporting,
    handleExportPDF,
    generateMealPlan,
    isGenerating,
    currentMealPlan,
    downloadPDF,
    printPDF,
    clearState
  };
};
