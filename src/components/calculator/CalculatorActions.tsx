
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from 'lucide-react';

interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
}

const CalculatorActions = ({ isCalculating, calculateResults }: CalculatorActionsProps) => {
  return (
    <Button 
      onClick={calculateResults} 
      variant="primary"
      animation="shimmer"
      disabled={isCalculating}
      className="flex items-center gap-2"
    >
      {isCalculating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Calculator className="h-4 w-4" />
      )}
      {isCalculating ? "Calculando..." : "Calcular"}
    </Button>
  );
};

export default CalculatorActions;
