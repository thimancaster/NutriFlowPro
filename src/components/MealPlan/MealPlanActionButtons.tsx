
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealPlanSettings } from '@/utils/mealGeneratorUtils';
import { generateMealPlanPDF } from '@/utils/pdf/mealPlanPdfUtils';

interface MealPlanActionButtonsProps {
  mealPlan: any;
  settings: MealPlanSettings;
}

const MealPlanActionButtons: React.FC<MealPlanActionButtonsProps> = ({ mealPlan, settings }) => {
  const { toast } = useToast();
  
  const handleExportPDF = () => {
    try {
      const doc = generateMealPlanPDF({ mealPlan, settings });
      
      // Save PDF
      doc.save('plano_alimentar.pdf');
      
      toast({
        title: "PDF gerado",
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
  
  const handlePrint = () => {
    try {
      const doc = generateMealPlanPDF({ mealPlan, settings });
      
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
        description: "Não foi possível gerar o PDF para impressão",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF} 
        className="flex items-center gap-1"
      >
        <FileDown className="h-4 w-4" />
        <span>Exportar PDF</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint} 
        className="flex items-center gap-1 print:hidden"
      >
        <Printer className="h-4 w-4" />
        <span>Imprimir</span>
      </Button>
    </div>
  );
};

export default MealPlanActionButtons;
