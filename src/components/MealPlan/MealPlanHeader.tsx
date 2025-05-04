
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';

interface MealPlanHeaderProps {
  generatePDF: () => Promise<void>;
  generating: boolean;
}

const MealPlanHeader: React.FC<MealPlanHeaderProps> = ({ 
  generatePDF, 
  generating 
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Montagem do Plano Alimentar</h2>
      <Button 
        onClick={generatePDF} 
        disabled={generating}
        className="bg-blue-500 text-white hover:bg-white hover:text-blue-500 border border-blue-500 transition-all duration-200"
      >
        {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
        Exportar PDF
      </Button>
    </div>
  );
};

export default MealPlanHeader;
