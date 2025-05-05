
import React from 'react';
import { Button } from "@/components/ui/button";

interface CalculatorActionsProps {
  isCalculating: boolean;
  calculateResults: () => void;
}

const CalculatorActions = ({ isCalculating, calculateResults }: CalculatorActionsProps) => {
  return (
    <Button 
      onClick={calculateResults} 
      className="bg-nutri-green hover:bg-nutri-green-dark"
      disabled={isCalculating}
    >
      Calcular
    </Button>
  );
};

export default CalculatorActions;
