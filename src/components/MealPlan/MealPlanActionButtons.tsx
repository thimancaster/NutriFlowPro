
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealPlanSettings } from '@/utils/mealGeneratorUtils';
import { generateMealPlanPDF } from '@/utils/pdf/pdfExport';

interface MealPlanActionButtonsProps {
  mealPlan: any;
  settings: MealPlanSettings;
}

const MealPlanActionButtons: React.FC<MealPlanActionButtonsProps> = ({ mealPlan, settings }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handleExportPDF = async () => {
    if (isExporting) return; // Prevent multiple clicks
    
    setIsExporting(true);
    try {
      // Use setTimeout to prevent UI blocking
      setTimeout(() => {
        const doc = generateMealPlanPDF({ 
          meals: mealPlan,
          totalCalories: 0, // Calculate or provide these values
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
          patientName: settings.patientName || "Paciente",
          settings: {
            patientName: settings.patientName,
            patientData: settings.patientData,
            patientAge: settings.patientAge,
            patientGender: settings.patientGender
          }
        });
        
        // Save PDF
        doc.save('plano_alimentar.pdf');
        
        toast({
          title: "PDF gerado",
          description: "O plano alimentar foi baixado com sucesso"
        });
        setIsExporting(false);
      }, 10);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
      setIsExporting(false);
    }
  };
  
  const handlePrint = async () => {
    if (isPrinting) return; // Prevent multiple clicks
    
    setIsPrinting(true);
    try {
      // Use setTimeout to prevent UI blocking
      setTimeout(() => {
        const doc = generateMealPlanPDF({ 
          meals: mealPlan,
          totalCalories: 0, // Calculate or provide these values
          totalProtein: 0,
          totalCarbs: 0,
          totalFats: 0,
          patientName: settings.patientName || "Paciente",
          settings: {
            patientName: settings.patientName,
            patientData: settings.patientData,
            patientAge: settings.patientAge,
            patientGender: settings.patientGender
          }
        });
        
        // Open PDF in a new tab for printing
        window.open(URL.createObjectURL(doc.output('blob')));
        
        toast({
          title: "PDF gerado",
          description: "O plano alimentar foi aberto em uma nova aba para impressão"
        });
        setIsPrinting(false);
      }, 10);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF para impressão",
        variant: "destructive"
      });
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportPDF} 
        disabled={isExporting}
        className="flex items-center gap-1"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        <span>{isExporting ? "Exportando..." : "Exportar PDF"}</span>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePrint} 
        disabled={isPrinting}
        className="flex items-center gap-1 print:hidden"
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
        <span>{isPrinting ? "Preparando..." : "Imprimir"}</span>
      </Button>
    </div>
  );
};

export default MealPlanActionButtons;
