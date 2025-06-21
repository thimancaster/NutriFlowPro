
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calculator, Loader2 } from 'lucide-react';

interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
  disabled?: boolean;
}

const CalculatorActions = ({ isCalculating, calculateResults, disabled }: CalculatorActionsProps) => {
  return (
    <div className="flex justify-center">
      <Button 
        onClick={calculateResults} 
        variant="primary"
        animation="shimmer"
        disabled={isCalculating || disabled}
        className="flex items-center gap-2 w-full max-w-md"
        size="lg"
      >
        {isCalculating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Calculator className="h-4 w-4" />
        )}
        {isCalculating ? "Calculando..." : "Calcular"}
      </Button>
    </div>
  );
};

export default CalculatorActions;
