
import React from 'react';
import { ENPCalculatorHeader } from './enp/ENPCalculatorHeader';
import { ENPCalculatorForm } from './enp/ENPCalculatorForm';
import { useENPCalculatorLogic } from './enp/ENPCalculatorLogic';

interface ENPCalculatorInterfaceProps {
  onCalculationComplete?: (results: any) => void;
  onGenerateMealPlan?: () => void;
  onExportResults?: () => void;
}

export const ENPCalculatorInterface: React.FC<ENPCalculatorInterfaceProps> = ({
  onCalculationComplete,
  onGenerateMealPlan,
  onExportResults
}) => {
  const calculatorLogic = useENPCalculatorLogic();
  
  return (
    <div className="space-y-6">
      {/* Informações sobre ENP */}
      <ENPCalculatorHeader />
      
      {/* Formulário principal */}
      <ENPCalculatorForm
        {...calculatorLogic}
        onCalculate={calculatorLogic.handleCalculate}
        onExportResults={onExportResults || calculatorLogic.handleExportResults}
      />
    </div>
  );
};
