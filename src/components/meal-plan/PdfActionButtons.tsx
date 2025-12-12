import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMealPlanPDF } from '@/utils/pdf/pdfExport';
import { Patient } from '@/types';
import { MealPlan } from '@/types/meal';

interface PdfActionButtonsProps {
  activePatient: Patient;
  mealPlan: MealPlan;
}

const PdfActionButtons: React.FC<PdfActionButtonsProps> = ({ activePatient, mealPlan }) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const getValidGender = (gender?: string): 'male' | 'female' | undefined => {
    if (gender === 'male' || gender === 'female') return gender;
    return undefined;
  };

  const convertMealsForPdf = (meals: any[]) => {
    return meals.map((meal, index) => ({
      name: meal.name || `Refeição ${index + 1}`,
      calories: meal.total_calories || meal.calories || 0,
      protein: meal.total_protein || meal.protein || 0,
      carbs: meal.total_carbs || meal.carbs || 0,
      fat: meal.total_fats || meal.fats || meal.fat || 0,
      percent: Math.round((meal.total_calories || meal.calories || 0) / mealPlan.total_calories * 100) || Math.round(100 / meals.length),
      suggestions: meal.foods?.map((food: any) => `${food.name || food.food_name} (${food.quantity}${food.unit})`) || 
                   meal.suggestions || 
                   meal.foodSuggestions || 
                   []
    }));
  };

  const getPdfOptions = () => {
    const patientAge = activePatient.birth_date 
      ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
      : undefined;
    
    return {
      patientName: activePatient.name,
      patientAge,
      patientGender: getValidGender(activePatient.gender),
      meals: convertMealsForPdf(mealPlan.meals),
      totalCalories: mealPlan.total_calories || 0,
      totalProtein: mealPlan.total_protein || 0,
      totalCarbs: mealPlan.total_carbs || 0,
      totalFats: mealPlan.total_fats || 0
    };
  };
  
  const handlePrint = () => {
    if (!mealPlan?.meals || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    setIsPrinting(true);

    try {
      const doc = generateMealPlanPDF(getPdfOptions());
      
      // Open PDF in new window for printing
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }
      
      toast({
        title: "Impressão iniciada",
        description: "O plano alimentar foi aberto para impressão"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!mealPlan?.meals || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);

    try {
      const doc = generateMealPlanPDF(getPdfOptions());
      doc.save(`Plano_Alimentar_${activePatient.name.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: "PDF baixado",
        description: "O plano alimentar foi baixado com sucesso"
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleDownloadPDF}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        {isDownloading ? "Baixando..." : "Baixar PDF"}
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handlePrint}
        disabled={isPrinting}
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        {isPrinting ? "Preparando..." : "Imprimir"}
      </Button>
    </>
  );
};

export default PdfActionButtons;
