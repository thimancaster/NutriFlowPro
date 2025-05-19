
import React from 'react';

interface CalorieSummaryProps {
  targetCalories: number;
  actualCalories: number;
  difference: number;
  percentageDifference: number;
}

const CalorieSummary: React.FC<CalorieSummaryProps> = ({ 
  targetCalories, 
  actualCalories, 
  difference, 
  percentageDifference 
}) => {
  const hasDiscrepancy = Math.abs(difference) > 1; // Allow for tiny rounding differences
  
  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-medium text-gray-800">Resumo Calórico</h4>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-600">Meta calórica (VET):</div>
        <div className="font-medium text-right">{targetCalories} kcal</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm text-gray-600">Soma dos macronutrientes:</div>
        <div className="font-medium text-right">{actualCalories} kcal</div>
      </div>
      
      {hasDiscrepancy && (
        <>
          <div className="grid grid-cols-2 gap-2 border-t pt-2">
            <div className="text-sm text-gray-600">Diferença:</div>
            <div className={`font-medium text-right ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : ''}`}>
              {difference > 0 ? '+' : ''}{difference} kcal ({percentageDifference > 0 ? '+' : ''}{percentageDifference}%)
            </div>
          </div>
          <div className="text-xs text-gray-500 italic">
            Pequenas diferenças podem ocorrer devido a arredondamentos.
          </div>
        </>
      )}
    </div>
  );
};

export default CalorieSummary;
