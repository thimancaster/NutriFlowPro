
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator } from 'lucide-react';

interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
}

const CalculatorActions = ({ isCalculating, calculateResults }: CalculatorActionsProps) => {
  return (
    <Button 
      onClick={calculateResults} 
      className="bg-nutri-green hover:bg-nutri-green-dark transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
      disabled={isCalculating}
      animation="shimmer"
    >
      <Calculator className="h-4 w-4 mr-2" />
      Calcular
    </Button>
  );
};

export default CalculatorActions;
