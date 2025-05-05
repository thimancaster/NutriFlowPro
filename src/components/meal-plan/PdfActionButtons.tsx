
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePdfAsync } from '@/utils/pdfExport';

interface PdfActionButtonsProps {
  activePatient: any;
  mealPlan: any;
}

const PdfActionButtons: React.FC<PdfActionButtonsProps> = ({ activePatient, mealPlan }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    try {
      // Use async PDF generation to avoid blocking UI
      const doc = await generatePdfAsync({ 
        meals: mealPlan,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0,
        patientName: activePatient?.name || 'Paciente',
        settings: { 
          patientName: activePatient?.name || 'Paciente',
          patientData: activePatient
        } 
      });
      
      // Save PDF
      doc.save(`plano_alimentar_${activePatient?.name?.replace(/\s+/g, '_').toLowerCase() || 'paciente'}.pdf`);
      
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
    } finally {
      setIsExporting(false);
    }
  };
  
  const handlePrint = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    
    try {
      // Use async PDF generation to avoid blocking UI
      const doc = await generatePdfAsync({ 
        meals: mealPlan,
        totalCalories: mealPlan.total_calories || 0,
        totalProtein: mealPlan.total_protein || 0,
        totalCarbs: mealPlan.total_carbs || 0,
        totalFats: mealPlan.total_fats || 0,
        patientName: activePatient?.name || 'Paciente',
        settings: { 
          patientName: activePatient?.name || 'Paciente',
          patientData: activePatient
        } 
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
        description: "Não foi possível gerar o PDF para impressão",
        variant: "destructive"
      });
    } finally {
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

export default PdfActionButtons;
