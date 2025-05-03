
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateMealPlanPDF } from '@/utils/pdfExport';
import { Patient, MealPlan } from '@/types';

interface PdfActionButtonsProps {
  activePatient: Patient | null;
  mealPlan: MealPlan | null;
}

const PdfActionButtons: React.FC<PdfActionButtonsProps> = ({
  activePatient,
  mealPlan,
}) => {
  const { toast } = useToast();

  const handlePrint = () => {
    if (!mealPlan?.meals || !activePatient) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    try {
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : undefined;
      
      const doc = generateMealPlanPDF({
        patientName: activePatient.name,
        patientAge,
        patientGender: activePatient.gender || undefined,
        meals: mealPlan.meals,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0
      });

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

    try {
      const patientAge = activePatient.birth_date 
        ? Math.floor((new Date().getTime() - new Date(activePatient.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) 
        : undefined;
      
      const doc = generateMealPlanPDF({
        patientName: activePatient.name,
        patientAge,
        patientGender: activePatient.gender || undefined,
        meals: mealPlan.meals,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0
      });

      // Download the PDF file
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
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handleDownloadPDF}
      >
        <FileText className="h-4 w-4" />
        Baixar PDF
      </Button>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </Button>
    </>
  );
};

export default PdfActionButtons;
