
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';

export interface MealPlanHeaderProps {
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
        variant="nutri-blue"
        animation="shimmer"
        className="flex items-center gap-2"
      >
        {generating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        {generating ? "Gerando..." : "Exportar PDF"}
      </Button>
    </div>
  );
};

export default MealPlanHeader;
